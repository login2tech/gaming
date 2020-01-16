// const fs = require('fs');
const Item = require('./Tournament');
const Team = require('../teams/Team');
const ObjName = 'Tournament';
const moment = require('moment');
const User = require('../../models/User');
// const TeamUser = require('../teams/TeamUser');
const TournamentMatch = require('./TournamentMatch');
const CreditTransactions = require('../../models/CreditTransactions');
const Notif = require('../../models/Notification');
const Trophy = require('./Trophy');
const Raven = require('raven');
const matchController = require('../matches/controller');

const changeIntoBye = function(seed, participantsCount) {
  //return seed <= participantsCount ?  seed : '{0} (= bye)'.format(seed);
  return seed <= participantsCount ? seed : null;
};
const llgg = function(a, b) {
  console.log(a, b);
};

const shuffle_me = function(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};
const getBracket = function(participants) {
  const participantsCount = participants.length;
  const rounds = Math.ceil(Math.log(participantsCount) / Math.log(2));
  const bracketSize = Math.pow(2, rounds);
  const requiredByes = bracketSize - participantsCount;

  if (participantsCount < 2) {
    return [[], rounds, bracketSize, requiredByes];
  }
  if (participantsCount == 2) {
    return [[[1, 2]], rounds, bracketSize, requiredByes];
  }

  if (participantsCount == 4) {
    return [[[1, 2], [3, 4]], rounds, bracketSize, requiredByes];
  }

  if (participantsCount == 6) {
    return [[[1, 2], [3, 4], [5, 6]], rounds, bracketSize, requiredByes];
  }

  if (participantsCount == 8) {
    return [
      [[1, 2], [3, 4], [5, 6], [7, 8]],
      rounds,
      bracketSize,
      requiredByes
    ];
  }

  if (participantsCount == 10) {
    return [
      [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]],
      rounds,
      bracketSize,
      requiredByes
    ];
  }

  if (participantsCount == 12) {
    return [
      [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12]],
      rounds,
      bracketSize,
      requiredByes
    ];
  }
  if (participantsCount == 14) {
    return [
      [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14]],
      rounds,
      bracketSize,
      requiredByes
    ];
  }
  if (participantsCount == 16) {
    return [
      [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16]],
      rounds,
      bracketSize,
      requiredByes
    ];
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
      // llgg('match created');
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

const takeMoneyFromMember = function(uid, input_val, match_id) {
  // llgg(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let credit_balance = usr.get('credit_balance');

        // llgg(credit_balance);
        credit_balance -= parseFloat(input_val);

        // llgg(credit_balance);
        usr
          .save({credit_balance: credit_balance}, {patch: true})
          .then(function(usr) {
            new CreditTransactions()
              .save({
                user_id: uid,
                obj_type: 't_' + match_id,
                details: 'Credits deducted for joining tournament #' + match_id,
                qty: -parseFloat(input_val)
              })
              .then(function(o) {})
              .catch(function(err) {
                // llgg(4, err);

                Raven.captureException(err);
              });
          })
          .catch(function(err) {
            // llgg(141, err);

            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      // llgg(11, err);
      //
      Raven.captureException(err);
    });
};

const giveTrophy = function(type, tid, team_id, team_players) {
  for (let i = 0; i < team_players.length; i++) {
    new Trophy()
      .save({
        type: type,
        user_id: team_players[i],
        tournament_id: tid,
        reset_done: false
      })
      .then(function() {
        //
      })
      .catch(function(err) {
        Raven.captureException(err);
      });
  }
};

const giveWins = function(tid, tour) {
  console.log(tour);
  let brackets = tour.brackets;
  console.log(brackets);
  let teams_obj = tour.teams_obj;
  console.log(teams_obj);
  brackets = typeof brackets == 'string' ? JSON.parse(brackets) : brackets;
  teams_obj = typeof teams_obj == 'string' ? JSON.parse(teams_obj) : teams_obj;
  const total_rounds = brackets.total_rounds;
  const gold_team = brackets.winner;
  let gold_silver_teams = brackets['round_' + total_rounds];
  gold_silver_teams = gold_silver_teams[0];
  llgg(gold_silver_teams);

  const team_obj_keys = Object.keys(teams_obj);

  console.log('gold_team_id is', gold_team);

  const gold_team_loc = team_obj_keys.indexOf('team_' + gold_team) + 1;
  console.log('gold_team_loc is', gold_team_loc);

  let silver_team;
  if (gold_team_loc == gold_silver_teams[0]) {
    silver_team = gold_silver_teams[1];
  } else {
    silver_team = gold_silver_teams[0];
  }
  console.log('silver_team_loc is', silver_team);
  // gold_team;
  // gold_team = teams_obj['team_' + team_obj_keys[gold_team - 1]];
  silver_team = parseInt(
    ('' + team_obj_keys[silver_team - 1]).replace('team_', '')
  );

  // gold decided, silver decided
  const bronze_round = brackets['round_' + (total_rounds - 1)];

  // [[1,4],[3,2]]
  let bronze_team = false;
  if (bronze_round[0][0] == gold_team_loc) {
    bronze_team = bronze_round[0][1];
  } else if (bronze_round[0][1] == gold_team_loc) {
    bronze_team = bronze_round[0][0];
  } else if (bronze_round[1][0] == gold_team_loc) {
    bronze_team = bronze_round[1][1];
  } else if (bronze_round[1][1] == gold_team_loc) {
    bronze_team = bronze_round[1][0];
  }
  bronze_team = parseInt(
    ('' + team_obj_keys[bronze_team - 1]).replace('team_', '')
  );
  // bronze_found
  const gold_players = teams_obj['team_' + gold_team];
  const silver_players = teams_obj['team_' + silver_team];
  const bronze_players = teams_obj['team_' + bronze_team];

  console.log('gold team is ', gold_team);
  console.log('silver team is ', silver_team);
  console.log('bronze team is ', bronze_team);
  console.log('gold_players are ', gold_players);
  console.log('silver_players are ', silver_players);
  console.log('bronze_players are ', bronze_players);

  matchController.giveXPtoTeam(gold_team, gold_players, tid, 't', 50);
  if (tour.member_tournament) {
    giveTrophy('blue', tid, gold_team, gold_players);
  } else {
    giveTrophy('gold', tid, gold_team, gold_players);
  }
  giveTrophy('silver', tid, silver_team, silver_players);
  giveTrophy('bronze', tid, bronze_team, bronze_players);

  llgg('winners are: ');
  llgg('gold', gold_team, gold_players);
  llgg('silver', silver_team, silver_players);
  llgg('bronze', bronze_team, bronze_players);
  //
};

const proceed_to_next_round = function(t_id, t_round) {
  llgg(t_id, t_round);
  new TournamentMatch()
    .where({
      tournament_id: t_id,
      match_round: t_round
    })
    .orderBy('id', 'ASC')
    .fetchAll()
    .then(function(round_matches) {
      round_matches = round_matches.toJSON();
      llgg('we have ', round_matches.length, ' in this round');
      const winner_teams = [];
      for (let i = 0; i < round_matches.length; i++) {
        const rm = round_matches[i];
        if (
          round_matches[i].result != 'team_1' &&
          round_matches[i].result != 'team_2'
        ) {
          llgg(round_matches[i]);
          llgg('not proceeding as there is 1 match which doesnt have results.');
          return;
        }
        llgg(' found a winner team');
        if (rm.result == 'team_1') {
          winner_teams.push(rm.team_1_id);
        } else if (rm.result == 'team_2') {
          winner_teams.push(rm.team_2_id);
        }
      }
      llgg('winners of this round are: ', winner_teams);
      let create_further_matches = true;
      if (
        round_matches.length == winner_teams.length &&
        winner_teams.length == 1
      ) {
        // last match, tournament ends here
        create_further_matches = false;
        // new Item()
        //   .where({
        //     id: t_id
        //   })
        //   .fetch()
        //   .then(function(tournament) {
        //     tournament
        //       .save({
        //         status: 'complete'
        //       })
        //       .then(function(e) {
        //         // llgg('brackets updated');
        //         llgg('tournament ended, distribute stuff!');
        //       })
        //       .catch(function(err) {
        //         //
        //         Raven.captureException(err);
        //       });
        //   });
        // return;
      }

      llgg('creating next round or saving tourament data');
      new Item()
        .where({
          id: t_id
        })
        .fetch()
        .then(function(tournament) {
          let teams_obj = tournament.get('teams_obj');
          teams_obj = JSON.parse(teams_obj);
          const teams_obj_keys = Object.keys(teams_obj);
          const participants = winner_teams.map(function(w_t_i_id) {
            w_t_i_id = parseInt(w_t_i_id);
            return teams_obj_keys.indexOf('team_' + w_t_i_id) + 1;
          });
          participants.sort();
          llgg('participants are : ', participants);
          let winner = false;
          const bracket_obj = getBracket(participants);
          if (winner_teams.length == 1) {
            winner = winner_teams[0];
          }
          // bracket_obj

          // llgg('brocket_obj is', bracket_obj);
          // llgg(bracket_obj);
          const brackets_round_original = bracket_obj[0];

          const brackets_round = brackets_round_original.map(function(br_mtch) {
            return br_mtch.map(function(br_plyr) {
              return participants[br_plyr - 1];
            });
          });

          let brackets = tournament.get('brackets');
          if (!brackets) {
            brackets = {};
            brackets.total_rounds = bracket_obj[1];
            brackets.rounds_calculated = 1;
            brackets.round_1 = brackets_round;
          } else {
            brackets = JSON.parse(brackets);
            brackets.rounds_calculated = brackets.rounds_calculated + 1;
            brackets.winner = winner;
            brackets['round_' + brackets.rounds_calculated] = brackets_round;
          }
          const current_round = brackets.rounds_calculated;
          brackets = JSON.stringify(brackets);
          const obj = {
            brackets: brackets
          };
          if (!create_further_matches) {
            obj.status = 'complete';
          }
          tournament
            .save(obj)
            .then(function(obj) {
              console.log('create_further_matches: ', create_further_matches);
              if (!create_further_matches) {
                console.log('giving wins');
                giveWins(t_id, obj.toJSON());
              }
            })
            .catch(function(err) {
              // llgg(err);
              Raven.captureException(err);
            });

          if (create_further_matches) {
            for (let i = brackets_round.length - 1; i >= 0; i--) {
              const team_set = brackets_round_original[i];
              // llgg('---- -- - - - -----');
              // llgg('team_set : ', team_set);
              const team_1 = team_set[0] ? winner_teams[team_set[0] - 1] : null;
              const team_2 = team_set[1] ? winner_teams[team_set[1] - 1] : null;
              if (team_1 && team_2) {
                createMatch(
                  team_1,
                  team_2,
                  teams_obj['team_' + team_1],
                  teams_obj['team_' + team_2],
                  tournament.id,
                  current_round,
                  tournament.starts_at
                );
              }
            }
          }
        });
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

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

      if (val.team_1_result && val.team_2_result) {
        const team_2_score = val.team_2_result.split('-');
        const team_2_score_reverse = team_2_score[1] + '-' + team_2_score[0];
        if (val.team_1_result != team_2_score_reverse) {
          val.status = 'disputed';
          val.result = 'disputed';
        } else {
          const tmp = val.team_1_result.split('-');
          if (parseInt(tmp[0]) > parseInt(tmp[1])) {
            val.result = 'team_1';
            val.status = 'complete';
          } else if (parseInt(tmp[1]) > parseInt(tmp[0])) {
            val.result = 'team_2';
            val.status = 'complete';
          } else {
            val.status = 'tie';
            val.result = 'Tie';
          }
        }
      } else {
        // pehle se result koi b ni posted, first time post ho rha h but lose dala h khud ka toh close match
        // llgg(
        // 'pehle se result koi b ni posted, first time post ho rha h but lose dala h khud ka toh close match'
        // );
        // const winner = false;
        // llgg(val);
        if (val.team_1_result) {
          const tmp = val.team_1_result.split('-');
          const team_1_score_reverse = tmp[1] + '-' + tmp[0];
          if (parseInt(tmp[0]) < parseInt(tmp[1])) {
            val.result = 'team_2';
            val.team_2_result = team_1_score_reverse;
            val.status = 'complete';
          }
        } else if (val.team_2_result) {
          const tmp = val.team_2_result.split('-');
          const team_2_score_reverse = tmp[1] + '-' + tmp[0];
          if (parseInt(tmp[1]) > parseInt(tmp[0])) {
            val.result = 'team_1';
            val.team_1_result = team_2_score_reverse;
            val.status = 'complete';
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

          proceed_to_next_round(tmp_match.tournament_id, tmp_match.match_round);

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

            // llgg('winers are ', win_team_members);
            // llgg('lossers are ', loose_team_members);

            win_team_members = win_team_members.split('|');
            loose_team_members = loose_team_members.split('|');

            const award_team_id =
              val.result == 'team_1'
                ? tmp_match.team_1_id
                : tmp_match.team_2_id;
            const loose_team_id =
              val.result == 'team_1'
                ? tmp_match.team_2_id
                : tmp_match.team_1_id;
            // llgg('giving xp now');
            matchController.giveXPtoTeam(
              award_team_id,
              win_team_members,
              tmp_match.id,
              't'
            );
            matchController.takeXPfromTeam(
              loose_team_id,
              loose_team_members,
              tmp_match.id,
              't'
            );
            // if (tmp_match.match_type == 'paid') {
            //   llgg('paid match giving xp');
            //   giveMoneyBackToTeam(
            //     award_team_id,
            //     tmp_match.match_fee,
            //     win_team_members,
            //     tmp_match.id
            //   );
            // }
            // llgg('score resotlo');
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
          // llgg(err);
          Raven.captureException(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      Raven.captureException(err);
      // llgg(err);
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
      //
      return res.status(200).send({ok: false, items: []});
    });
};

const createRoundMatches = function(match) {
  let teams = match.get('team_ids');
  let teams_obj = match.get('teams_obj');
  teams_obj = JSON.parse(teams_obj);
  teams = teams.split(',');
  const teams_count = teams.length;

  //   llgg('---- -- - - - --------- -- - - - -----');
  // llgg(teams);
  let participants = Array.from({length: teams_count}, (v, k) => k + 1);
  // llgg(participants);
  // randomize here.
  participants = shuffle_me(participants);
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
      // llgg('brackets updated');
    })
    .catch(function(err) {
      //
      Raven.captureException(err);
    });

  for (let i = 0; i < brackets_round.length; i++) {
    const team_set = brackets_round[i];
    // llgg('---- -- - - - -----');
    // llgg(team_set);
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
      // llgg(teams);
      // llgg(teams.indexOf('' + req.body.team_id));
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
        return el !== null && el != '';
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
          //

          Raven.captureException(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Join Tournament'
          });
        });
    })
    .catch(function(err) {
      //

      Raven.captureException(err);
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
      // llgg(err)
      return res.status(200).send([]);
    });
};
exports.listSingleMatchItem = function(req, res, next) {
  new TournamentMatch()
    .where({
      id: req.params.id
    })
    .fetch({
      withRelated: [
        'tournament',
        'tournament.ladder',
        'tournament.game',
        'team_1_info',
        'team_2_info',
        'team_1_info.team_users',
        'team_1_info.team_users.user_info',
        'team_2_info.team_users',
        'team_2_info.team_users.user_info'
      ]
    })
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, item: {}, is_404: true});
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
    })
    .catch(function(err) {
      // llgg(err);
      Raven.captureException(err);
      return res.status(200).send({ok: true, item: {}});
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

      // llgg(item);

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
            // llgg('here reached');
            new User()
              .where('id', 'IN', u)
              .fetchAll()
              .then(function(usrs) {
                // llgg('here reached too');
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
                //

                Raven.captureException(err);
                return res
                  .status(200)
                  .send({ok: true, item: item, users_data: {}});
              });
          })
          .catch(function(err) {
            //

            Raven.captureException(err);
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
      Raven.captureException(err);
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
    .query(function(qb) {
      qb.where('status', 'LIKE', 'started').orWhere(
        'registration_end_at',
        '>',
        moment()
      );
    })
    .fetchAll({withRelated: ['ladder', 'game']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      //

      Raven.captureException(err);
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
      Raven.captureException(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.addItem = function(req, res, next) {
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item({
    title: req.body.title ? req.body.title : '-',
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    max_players: req.body.max_players,
    starts_at: moment(req.body.starts_at),
    registration_start_at: req.body.registration_start_at,
    registration_end_at: req.body.registration_end_at,
    total_teams: req.body.total_teams,
    entry_fee: req.body.entry_fee,
    first_winner_price: req.body.first_winner_price,
    member_tournament: req.body.member_tournament == 'yes' ? true : false,
    second_winner_price: req.body.second_winner_price,
    teams_registered: 0,
    third_winner_price: req.body.third_winner_price,
    banner_url: req.body.banner_url ? req.body.banner_url : ''
  })
    .save()
    .then(function(item) {
      res.send({ok: true, msg: 'New Item has been created successfully.'});
    })
    .catch(function(err) {
      //
      Raven.captureException(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.updateItem = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();

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
          //
          Raven.captureException(err);
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the ' + ObjName});
        });
    })
    .catch(function(err) {
      //

      Raven.captureException(err);
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
      Raven.captureException(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the ' + ObjName});
    });
};

const resolveDispute = function(req, res, next, m_id, win_to) {
  let match_id;
  let winner;
  if (req) {
    match_id = req.body.id;
    winner = req.body.winner;
  } else {
    match_id = m_id;
    winner = win_to;
  }
  new TournamentMatch({id: match_id})
    .fetch()
    .then(function(match) {
      if (!match) {
        if (res) {
          return res.status(400).send({
            ok: false,
            msg: "Match doesn't exist"
          });
        } else {
          return;
        }
      }
      const tmp_match = match.toJSON();
      if (tmp_match.result != 'disputed') {
        if (res) {
          return res.status(400).send({
            ok: false,
            msg: 'Match not disputed'
          });
        } else {
          return;
        }
      }
      const final_result = winner;
      if (final_result != 'team_1' && final_result != 'team_2') {
        if (res) {
          return res.status(400).send({
            ok: false,
            msg: 'Thats not a valid result'
          });
        } else {
          return;
        }
      }
      const saved_info = {
        status: 'complete',
        result: final_result
      };

      match
        .save(saved_info, {method: 'update'})
        .then(function(match) {
          if (res) {
            res.status(200).send({
              ok: true,
              msg: 'Dispute resolved successfully',
              match: match.toJSON()
            });
          }
          const tmp_match = match.toJSON();
          // match
          proceed_to_next_round(tmp_match.tournament_id, tmp_match.match_round);

          if (final_result != 'team_1' && final_result != 'team_2') {
            return;
          }

          // get players
          let win_team_members;
          let loose_team_members;
          if (final_result == 'team_1') {
            win_team_members = match.get('team_1_players');
            loose_team_members = match.get('team_2_players');
          } else {
            win_team_members = match.get('team_2_players');
            loose_team_members = match.get('team_1_players');
          }
          win_team_members = win_team_members.split('|');
          loose_team_members = loose_team_members.split('|');

          // get winner team id
          const award_team_id =
            final_result == 'team_1'
              ? tmp_match.team_1_id
              : tmp_match.team_2_id;
          const loose_team_id =
            final_result == 'team_1'
              ? tmp_match.team_2_id
              : tmp_match.team_1_id;

          // giveWinToTeam(award_team_id,win_team_members,  tmp_match.id);
          matchController.giveXPtoTeam(
            award_team_id,
            win_team_members,
            tmp_match.id,
            't'
          );
          matchController.takeXPfromTeam(
            loose_team_id,
            loose_team_members,
            tmp_match.id,
            't'
          );
        })
        .catch(function(err) {
          Raven.captureException(err);
          if (res) {
            res.status(400).send({
              ok: false,
              msg: 'Failed to resolve the dispute'
            });
          }
        });
    })
    .catch(function(err) {
      Raven.captureException(err);
      if (res) {
        res.status(400).send({
          ok: false,
          msg: 'Failed to resolve dispute'
        });
      }
    });
};
exports.resolveDispute = resolveDispute;
exports.resolveDisputeWrap = function(req, res, next) {
  resolveDispute(req, res, next);
};
