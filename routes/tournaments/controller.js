// const fs = require('fs');
const Item = require('./Tournament');
const Team = require('../teams/Team');
const ObjName = 'Tournament';
const moment = require('moment');
const User = require('../../models/User');
const TeamUser = require('../teams/TeamUser');
const TournamentMatch = require('./TournamentMatch');
const CreditTransactions = require('../../models/CreditTransactions');

// const giveMoneyToMember = function(uid, input_val) {
//   new User()
//     .where({id: uid})
//     .fetch()
//     .then(function(usr) {
//       if (usr) {
//         let credit_balance = usr.get('credit_balance');
//         const prime = usr.get('prime');
//         if (prime) {
//           credit_balance += parseFloat(input_val);
//         } else {
//           credit_balance += parseFloat((4 / 5) * input_val);
//         }
//
//         usr
//           .save({credit_balance: credit_balance}, {patch: true})
//           .then(function(usr) {})
//           .catch(function(err) {
//             // console.log(err);
//           });
//       }
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
// };

const takeMoneyFromMember = function(uid, input_val, match_id) {
  // console.log(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let credit_balance = usr.get('credit_balance');

        // console.log(credit_balance);
        credit_balance -= parseFloat(input_val);

        // console.log(credit_balance);
        usr
          .save({credit_balance: credit_balance}, {patch: true})
          .then(function(usr) {
            new CreditTransactions()
              .save({
                user_id: uid,
                obj_type: 't_' + match_id,
                details: 'Credit Debit for joining tournament #' + match_id,
                qty: -parseFloat(input_val)
              })
              .then(function(o) {})
              .catch(function(err) {
                console.log(4, err);
              });
          })
          .catch(function(err) {
            console.log(141, err);
          });
      }
    })
    .catch(function(err) {
      console.log(11, err);
    });
};

// const giveXPtoTeam = function(team_id, input_val) {
//   new TeamUser()
//     .where({
//       team_id: team_id,
//       accepted: true
//     })
//     .fetchAll()
//     .then(function(usrs) {
//       usrs = usrs.toJSON();
//       for (let i = 0; i < usrs.length; i++) {
//         const uid = usrs[i].user_id;
//         // giveXpToMember(uid, input_val);
//       }
//     })
//     .catch(function(err) {
//       // console.log(err);
//     });
// };
// const giveMoneyBackToTeam = function(team_id, input_val) {
//   new TeamUser()
//     .where({
//       team_id: team_id,
//       accepted: true
//     })
//     .fetchAll()
//     .then(function(usrs) {
//       usrs = usrs.toJSON();
//       for (let i = 0; i < usrs.length; i++) {
//         const uid = usrs[i].user_id;
//         giveMoneyToMember(uid, input_val);
//       }
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
// };

exports.saveScore = function(req, res, next) {
  new TournamentMatch({id: req.body.id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: "Match doesn't exist"
        });
        return;
      }
      const val = req.body;
      const tmp_match = match.toJSON();
      if (tmp_match.team_1_result && tmp_match.team_2_result) {
        return res.status(400).send({ok: false, msg: 'Result already saved'});
      }
      if (val.team_1_result && tmp_match.team_2_result) {
        val.team_2_result = tmp_match.team_2_result;
      } else if (val.team_2_result && tmp_match.team_1_result) {
        val.team_1_result = tmp_match.team_1_result;
      }
      if (!val.team_1_result && !val.team_2_result) {
        res.status(400).send({
          ok: false,
          msg: "Match Data doesn't exist"
        });
        return;
      }

      if (
        val.team_1_result &&
        val.team_2_result &&
        val.team_1_result != '' &&
        val.team_2_result != ''
      ) {
        if (val.team_1_result != val.team_2_result) {
          val.status = 'disputed';
          val.result = 'disputed';
        } else {
          const tmp = val.team_1_result.split('-');
          if (parseInt(tmp[0]) > parseInt(tmp[1])) {
            val.result = 'team_1';
            val.status = 'Complete';
          } else if (parseInt(tmp[1]) > parseInt(tmp[0])) {
            val.result = 'team_2';
            val.status = 'Complete';
          } else {
            val.status = 'tie';
            val.result = 'Tie';
          }
        }
      }
      match
        .save(val)
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Score Updated successfully.',
            match: match.toJSON()
          });

          new TournamentMatch()
            .where({
              tournament_id: tmp_match.tournament_id,
              match_round: tmp_match.match_round
            })
            .fetchAll()
            .then(function(round_matches) {
              round_matches = round_matches.toJSON();
              const winner_teams = [];
              for (let i = round_matches.length - 1; i >= 0; i--) {
                const rm = round_matches[i];
                if (round_matches[i].status == 'pending') {
                  console.log(round_matches[i]);
                  return;
                }
                if (rm.result == 'team_1') {
                  winner_teams.push(rm.team_1_id);
                } else if (rm.result == 'team_1') {
                  winner_teams.push(rm.team_2_id);
                }
              }
              console.log('winners of this round are: ', winner_teams);

              new Item()
                .where({
                  id: tmp_match.tournament_id
                })
                .fetch()
                .then(function(tournament) {
                  let teams_obj = tournament.get('teams_obj');
                  teams_obj = JSON.parse(teams_obj);
                  const bracket_obj = getBracket(winner_teams);
                  console.log(bracket_obj);
                  const brackets_round = bracket_obj[0];

                  let brackets = tournament.get('brackets');
                  if (!brackets) {
                    brackets = {};
                    brackets.total_rounds = bracket_obj[1];
                    brackets.rounds_calculated = 1;
                    brackets.round_1 = brackets_round;
                  } else {
                    brackets = JSON.parse(brackets);
                    brackets.rounds_calculated = brackets.rounds_calculated + 1;
                    brackets[
                      'round_' + brackets.rounds_calculated
                    ] = brackets_round;
                  }
                  brackets = JSON.stringify(brackets);
                  tournament
                    .save({
                      brackets: brackets
                    })
                    .then(function(e) {
                      console.log('brackets updated');
                    })
                    .catch(function(err) {
                      console.log(err);
                    });

                  for (let i = brackets_round.length - 1; i >= 0; i--) {
                    const team_set = brackets_round[i];
                    // console.log('---- -- - - - -----');
                    // console.log(team_set);
                    const team_1 = team_set[0] ? team_set[0] : null;
                    const team_2 = team_set[1] ? team_set[1] : null;

                    createMatch(
                      team_1,
                      team_2,
                      team_set[0] ? teams_obj['team_' + team_1] : null,
                      team_set[1] ? teams_obj['team_' + team_2] : null,
                      tournament.id,
                      brackets.rounds_calculated,
                      tournament.starts_at
                    );
                  }
                });
            })
            .catch(function(err) {
              console.log(err);
            });

          if (val.result == 'team_1' || val.result == 'team_2') {
            let win_team_members;
            let loose_team_members;

            if (val.result == 'team_1') {
              win_team_members = match.get('team_1_players');
              loose_team_members = match.get('team_2_players');
            } else {
              win_team_members = match.get('team_2_players');
              loose_team_members = match.get('team_1_players');
            }

            // console.log('winers are ', win_team_members);
            // console.log('lossers are ', loose_team_members);

            // win_team_members = win_team_members.split('|');
            // loose_team_members = loose_team_members.split('|');

            // const award_team_id =
            //   val.result == 'team_1'
            //     ? tmp_match.team_1_id
            //     : tmp_match.team_2_id;
            // const loose_team_id =
            //   val.result == 'team_1'
            //     ? tmp_match.team_2_id
            //     : tmp_match.team_1_id;
            // console.log('giving xp now');
            // giveXPtoTeam(award_team_id, win_team_members, tmp_match.id);
            // takeXPfromTeam(loose_team_id, loose_team_members, tmp_match.id);
            // if (tmp_match.match_type == 'paid') {
            //   console.log('paid match giving xp');
            //   giveMoneyBackToTeam(
            //     award_team_id,
            //     tmp_match.match_fee,
            //     win_team_members,
            //     tmp_match.id
            //   );
            // }
            // console.log('score resotlo');
            // addScoreForTeam(
            //   tmp_match.game_id,
            //   tmp_match.ladder_id,
            //   'wins',
            //   win_team_members
            // );
            // addScoreForTeam(
            //   tmp_match.game_id,
            //   tmp_match.ladder_id,
            //   'loss',
            //   loose_team_members
            // );
          }
        })
        .catch(function(err) {
          console.log('1');
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      console.log('2');
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
    });
};

const takeMoneyFromTeam = function(team_id, input_val, team_members, match_id) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    takeMoneyFromMember(parseInt(team_members[i]), input_val, match_id);
  }
};

exports.listItem = function(req, res, next) {
  new Item()
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['ladder', 'game']})
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }

      return res
        .status(200)
        .send({ok: true, items: items.toJSON(), users_data: {}});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: false, items: []});
    });
};

const getBracket = function(participants) {
  const participantsCount = participants.length;
  const rounds = Math.ceil(Math.log(participantsCount) / Math.log(2));
  const bracketSize = Math.pow(2, rounds);
  const requiredByes = bracketSize - participantsCount;

  if (participantsCount < 2) {
    return [[], rounds, bracketSize, requiredByes];
  }

  let matches = [[1, 2]];

  for (let round = 1; round < rounds; round++) {
    const roundMatches = [];
    const sum = Math.pow(2, round + 1) + 1;

    for (let i = 0; i < matches.length; i++) {
      let home = changeIntoBye(matches[i][0], participantsCount);
      let away = changeIntoBye(sum - matches[i][0], participantsCount);
      roundMatches.push([home, away]);
      home = changeIntoBye(sum - matches[i][1], participantsCount);
      away = changeIntoBye(matches[i][1], participantsCount);
      roundMatches.push([home, away]);
    }
    matches = roundMatches;
  }

  return [matches, rounds, bracketSize, requiredByes];
};

const changeIntoBye = function(seed, participantsCount) {
  //return seed <= participantsCount ?  seed : '{0} (= bye)'.format(seed);
  return seed <= participantsCount ? seed : null;
};

const createMatch = function(team_1, team_2, t_1_u, t_2_u, t_id, round) {
  new TournamentMatch()
    .save({
      tournament_id: t_id,
      match_round: round,
      team_1_id: team_1,
      team_2_id: team_2,
      starts_at: moment().add(10, 'minutes'),
      team_1_players: t_1_u ? t_1_u.join('|') : null,
      team_2_players: t_2_u ? t_2_u.join('|') : null,
      status: 'pending'
    })
    .then(function() {
      console.log('match created');
    })
    .catch(function(err) {
      console.log(err);
    });
};

const createRoundMatches = function(match) {
  let teams = match.get('team_ids');
  let teams_obj = match.get('teams_obj');
  teams_obj = JSON.parse(teams_obj);
  teams = teams.split(',');
  const teams_count = teams.length;

  //   console.log('---- -- - - - --------- -- - - - -----');
  // console.log(teams);
  const participants = Array.from({length: teams_count}, (v, k) => k + 1);
  console.log(participants);
  const bracket_obj = getBracket(participants);
  const brackets_round = bracket_obj[0];

  let brackets = match.get('brackets');
  if (!brackets) {
    brackets = {};
    brackets.total_rounds = bracket_obj[1];
    brackets.rounds_calculated = 1;
    brackets.round_1 = brackets_round;
  } else {
    brackets = JSON.parse(brackets);
    brackets.rounds_calculated = brackets.rounds_calculated + 1;
    brackets.round[brackets.rounds_calculated] = brackets_round;
  }
  brackets = JSON.stringify(brackets);
  match
    .save({
      brackets: brackets
    })
    .then(function(e) {
      console.log('brackets updated');
    })
    .catch(function(err) {
      console.log(err);
    });

  for (let i = brackets_round.length - 1; i >= 0; i--) {
    const team_set = brackets_round[i];
    // console.log('---- -- - - - -----');
    // console.log(team_set);
    let team_1 = team_set[0] ? team_set[0] : null;
    let team_2 = team_set[1] ? team_set[1] : null;

    // team_set[0] = team_set[0] ? team_set[0]  : 0 ;
    team_1 = teams[team_1 - 1];
    team_2 = teams[team_2 - 1];

    createMatch(
      team_1,
      team_2,
      team_set[0] ? teams_obj['team_' + team_1] : null,
      team_set[1] ? teams_obj['team_' + team_2] : null,
      match.id,
      1,
      match.get('starts_at')
    );
  }
};

exports.join = function(req, res, next) {
  //
  if (!req.body.tournament_id) {
    res.status(400).send({ok: false, msg: 'Please enter Tournament ID'});
  }
  if (!req.body.team_id) {
    res.status(400).send({ok: false, msg: 'Please enter Team ID'});
  }
  new Item({id: req.body.tournament_id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: "Tournament doesn't exist"
        });
        return;
      }
      const tmp_m = match.toJSON();
      let teams = tmp_m.team_ids;
      let teams_obj = tmp_m.teams_obj;
      if (teams_obj == '' || !teams_obj) {
        teams_obj = '{}';
      }
      teams_obj = JSON.parse(teams_obj);
      let teams_registered = tmp_m.teams_registered;
      let users_list = tmp_m.users_list;
      if (!users_list) {
        users_list = '[]';
      }
      users_list = JSON.parse(users_list);
      const registration_end_at = tmp_m.registration_end_at;
      const registration_start_at = tmp_m.registration_start_at;
      const total_teams = tmp_m.total_teams;
      const mom = moment();
      if (mom.isAfter(registration_end_at)) {
        res.status(400).send({
          ok: false,
          msg: 'Registration Ended already'
          // match: match.toJSON()
        });
        return;
      }
      if (moment(registration_start_at).isAfter(mom)) {
        res.status(400).send({
          ok: false,
          msg: 'Registration Has yet not started'
          // match: match.toJSON()
        });
        return;
      }
      if (teams_registered >= total_teams) {
        res.status(400).send({
          ok: false,
          msg: 'All teams already joined'
          // match: match.toJSON()
        });
        return;
      }
      if (!teams) {
        teams = '';
      }
      teams = teams.split(',');
      // console.log(teams);
      // console.log(teams.indexOf('' + req.body.team_id));
      if (teams.indexOf('' + req.body.team_id) > -1) {
        res.status(400).send({
          ok: false,
          msg: 'Team already joined'
          // match: match.toJSON()
        });
        return;
      }

      teams.push(req.body.team_id);

      teams = teams.filter(function(el) {
        return el != null && el != '';
      });
      // let notif_to_send_to_teams = teams;
      teams = teams.join(',');
      teams_obj['team_' + req.body.team_id] = req.body.using_users;
      teams_registered = teams_registered + 1;

      const obj_to_save = {
        team_ids: teams,
        teams_registered: teams_registered,
        teams_obj: JSON.stringify(teams_obj)
        // status: 'accepted'
      };
      for (let i = req.body.using_users.length - 1; i >= 0; i--) {
        users_list.push('{' + req.body.using_users[i] + '}');
      }
      obj_to_save.users_list = JSON.stringify(users_list);

      if (teams_registered == total_teams) {
        obj_to_save.status = 'started';
      }
      match
        .save(obj_to_save)
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Joined successfully.',
            tournament: match.toJSON()
          });

          if (teams_registered == total_teams) {
            createRoundMatches(match);

            for (let i = 0; i < users_list.length; i++) {
              const uid = users_list[i].replace('{', '').replace('}', '');
              new Notif().save({
                description: 'The tournament you joined has started',
                user_id: uid,
                type: 'tournament',
                object_id: req.body.tournament_id
              });
            }
          } else {
            for (let i = 0; i < users_list.length; i++) {
              const uid = users_list[i].replace('{', '').replace('}', '');
              new Notif().save({
                description:
                  'A new team has joined the tournament you have joined.',
                user_id: uid,
                type: 'tournament',
                object_id: req.body.tournament_id
              });
            }
          }

          if (match.get('match_type') != 'free') {
            takeMoneyFromTeam(
              req.body.team_id,
              match.get('entry_fee'),
              req.body.using_users,
              match.id
            );
          }
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Join Tournament'
          });
        });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Join Tournament'
      });
    });
};

exports.listPaged = function(req, res, next) {
  let c = new Item();
  c = c.orderBy('id', 'DESC');

  let p;
  if (req.query.paged && parseInt(req.query.paged) > 1) {
    p = parseInt(req.query.paged);
  } else {
    p = 1;
  }
  c.fetchPage({page: p, pageSize: 10})
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }
      return res
        .status(200)
        .send({ok: true, items: items.toJSON(), pagination: items.pagination});
    })
    .catch(function(err) {
      // console.log(err)
      return res.status(200).send([]);
    });
};

exports.listSingleItem = function(req, res, next) {
  new Item()
    .where('id', req.params.id)
    .fetch({withRelated: ['ladder', 'game', 'matches']})
    .then(function(item) {
      if (!item) {
        return res.status(400).send({
          ok: false,
          id: req.params.id,
          title: '',
          content: ''
        });
      }
      let users_list = item.get('users_list');
      item = item.toJSON();

      // console.log(item);

      let team_ids = item.team_ids;
      if (!team_ids) {
        team_ids = '';
      }
      const new_t_id = [];
      team_ids = team_ids.split(',');
      for (let i = 0; i < team_ids.length; i++) {
        if (!team_ids[i]) {
          continue;
        }
        new_t_id.push(parseInt(team_ids[i]));
      }
      if (!new_t_id) {
        new_t_id = [];
      }
      if (new_t_id && new_t_id.length) {
        new Team()
          .where('id', 'in', new_t_id)
          .fetchAll({
            withRelated: []
          })
          .then(function(data) {
            if (data) {
              data = data.toJSON();
              item.teams = data;
              // return res.status(200).send({ok: true, item: item});
            }

            if (!users_list) {
              users_list = '[]';
            }
            users_list = JSON.parse(users_list);
            const u = [];
            for (let i = users_list.length - 1; i >= 0; i--) {
              let k = users_list[i];
              k = k.replace('{', '');
              k = k.replace('}', '');

              u.push(parseInt(k));
            }
            console.log('here reached');
            new User()
              .where('id', 'IN', u)
              .fetchAll()
              .then(function(usrs) {
                console.log('here reached too');
                if (!usrs) {
                  return res
                    .status(200)
                    .send({ok: true, item: item, users_data: {}});
                }
                usrs = usrs.toJSON();
                const users_data = {};
                for (let i = usrs.length - 1; i >= 0; i--) {
                  users_data['usr_' + usrs[i].id] = {
                    first_name: usrs[i].first_name,
                    last_name: usrs[i].last_name,
                    username: usrs[i].username,
                    id: usrs[i].id
                  };
                }
                return res.status(200).send({
                  ok: true,
                  item: item,
                  users_data: users_data
                });
              })
              .catch(function(err) {
                console.log(err);
                return res
                  .status(200)
                  .send({ok: true, item: item, users_data: {}});
              });
          })
          .catch(function(err) {
            console.log(err);
            return res.status(400).send({
              id: req.params.id,
              title: '',
              content: '',
              msg: 'Failed to fetch from db'
            });
          });
      } else {
        item.teams = [];
        return res.status(200).send({ok: true, item: item});
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'Failed to fetch from db'
      });
    });
};

exports.listupcoming = function(req, res, next) {
  new Item()
    .orderBy('created_at', 'DESC')
    .where('starts_at', '>', moment())
    // .where('registration_end_at', '>', moment())
    .fetchAll({withRelated: ['ladder', 'game']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.t_of_user = function(req, res, next) {
  const u = req.query.uid;
  new Item()
    .where('users_list', 'LIKE', '%{' + u + '}%')

    .fetchPage({
      page: req.query.page ? req.query.page : 1,
      pageSize: 5,
      withRelated: ['ladder', 'game']
    })

    .then(function(items) {
      res.status(200).send({
        ok: true,
        items: items.toJSON(),
        pagination: items.pagination
      });
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.addItem = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  console.log(req.body);
  new Item({
    title: req.body.title,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: moment(req.body.starts_at),
    registration_start_at: moment(req.body.registration_start_at),
    registration_end_at: moment(req.body.registration_end_at),
    total_teams: req.body.total_teams,
    entry_fee: req.body.entry_fee,
    first_winner_price: req.body.first_winner_price,
    second_winner_price: req.body.second_winner_price,
    teams_registered: 0,
    third_winner_price: req.body.third_winner_price
  })
    .save()
    .then(function(item) {
      res.send({ok: true, msg: 'New Item has been created successfully.'});
    })
    .catch(function(err) {
      // console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.updateItem = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  // req.assert('category_id', 'Category cannot be blank').notEmpty();

  // console.log(req.body);
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const item = new Item({id: req.body.id});
  const obj = {
    title: req.body.title,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: req.body.starts_at,
    registration_start_at: req.body.registration_start_at,
    registration_end_at: req.body.registration_end_at,
    total_teams: req.body.total_teams,
    entry_fee: req.body.entry_fee,
    first_winner_price: req.body.first_winner_price,
    second_winner_price: req.body.second_winner_price,
    third_winner_price: req.body.third_winner_price
  };

  if (req.body.remove_media) {
    obj.image_url = '';
  }
  item
    .save(obj)
    .then(function(blg) {
      blg
        .fetch()
        .then(function(bll) {
          res.send({
            item: bll.toJSON(),
            msg: ObjName + ' has been updated.'
          });
        })
        .catch(function(err) {
          // console.log(err);
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the ' + ObjName});
        });
    })
    .catch(function(err) {
      // console.log(err);

      res
        .status(400)
        .send({msg: 'Something went wrong while updating the ' + ObjName});
    });
};

exports.deleteItem = function(req, res, next) {
  new Item({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The ' + ObjName + ' has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the ' + ObjName});
    });
};
