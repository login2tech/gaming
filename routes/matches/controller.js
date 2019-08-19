const moment = require('moment');

const Item = require('./Match');
// const TeamUser = require('../teams/TeamUser');
const User = require('../../models/User');
const Notif = require('../../models/Notification');
const XP = require('../../models/XP');
const CashTransactions = require('../../models/CashTransactions');
const CreditTransactions = require('../../models/CreditTransactions');
const XPTransactions = require('../../models/XPTransactions');
const Score = require('../../models/Score');

const getXPBasedOn = function(current_xp) {
  return 10;
};
const getXPRemoveBasedOn = function(current_xp) {
  return 3;
};

const giveXpToMember = function(uid, match_id) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let xp = usr.get('life_xp');
        const double_xp = usr.get('double_xp');
        let xP_to_add = getXPBasedOn(xp);

        if (double_xp) {
          xP_to_add = xP_to_add * 2;
        }
        xp += xP_to_add;
        usr
          .save({life_xp: xp}, {patch: true})
          .then(function(usr) {})
          .catch(function(err) {
            console.log(1, err);
          });

        const year = moment().format('YYYY');
        const season = moment().format('Q');

        new XP()
          .where({
            year: year,
            season: season,
            user_id: uid
          })
          .fetch()
          .then(function(xpObj) {
            if (xpObj) {
              xpObj
                .save({
                  xp: xpObj.get('xp') + xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  console.log(2, err);
                });
            } else {
              new XP()
                .save({
                  year: year,
                  season: season,
                  user_id: uid,
                  xp: xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  console.log(3, err);
                });
            }
            new XPTransactions()
              .save({
                user_id: uid,
                details: 'XP Credit for winning match #' + match_id,
                qty: xP_to_add
              })
              .then(function(o) {})
              .catch(function(err) {
                console.log(4, err);
              });
          })
          .catch(function(err) {
            console.log(5, err);
          });
      }
    })
    .catch(function(err) {
      console.log(6, err);
    });
};

const takeXpFromMember = function(uid, match_id) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let xp = usr.get('life_xp');
        // const double_xp = usr.get('double_xp');
        const xP_to_add = getXPRemoveBasedOn(xp);

        xp -= xP_to_add;
        usr
          .save({life_xp: xp}, {patch: true})
          .then(function(usr) {})
          .catch(function(err) {
            console.log(1, err);
          });

        const year = moment().format('YYYY');
        const season = moment().format('Q');

        new XP()
          .where({
            year: year,
            season: season,
            user_id: uid
          })
          .fetch()
          .then(function(xpObj) {
            if (xpObj) {
              xpObj
                .save({
                  xp: xpObj.get('xp') - xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  console.log(2, err);
                });
            } else {
              new XP()
                .save({
                  year: year,
                  season: season,
                  user_id: uid,
                  xp: -xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  console.log(3, err);
                });
            }
            new XPTransactions()
              .save({
                user_id: uid,
                details: 'XP Debit for lossing match #' + match_id,
                qty: -xP_to_add
              })
              .then(function(o) {})
              .catch(function(err) {
                console.log(4, err);
              });
          })
          .catch(function(err) {
            console.log(5, err);
          });
      }
    })
    .catch(function(err) {
      console.log(6, err);
    });
};

const addScoreForMember = function(uid, ladder_id, type) {
  console.log('168');
  const year = moment().format('YYYY');
  const season = moment().format('Q');

  new Score()
    .where({
      year: year,
      ladder_id: ladder_id,
      season: season,
      user_id: uid
    })
    .fetch()
    .then(function(scoreObj) {
      if (scoreObj) {
        scoreObj
          .save({
            [type]: scoreObj.get(type) + 1
          })
          .then(function(o) {})
          .catch(function(err) {
            console.log(4, err);
          });
      } else {
        new Score()
          .save({
            year: year,
            season: season,
            user_id: uid,
            ladder_id: ladder_id,
            [type]: 1
          })
          .then(function(o) {})
          .catch(function(err) {
            console.log(4, err);
          });
      }
    })
    .catch(function(err) {
      console.log(7, err);
    });
  // console.log('208')

  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      let tpye_val;
      if (usr) {
        tpye_val = usr.get(type);
        tpye_val++;
        usr
          .save({[type]: tpye_val}, {patch: true})
          .then(function(usr) {
            console.log('221');
          })
          .catch(function(err) {
            console.log(7, err);
          });
      }
    })
    .catch(function(err) {
      console.log(7, err);
    });
};

const giveMoneyToMember = function(uid, input_val, match_id) {
  console.log('match_fee is: ', input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get('cash_balance');

        const prime = usr.get('prime');
        let val;

        if (prime) {
          val = parseFloat(input_val);
        } else {
          val = parseFloat((4 / 5) * input_val);
        }
        // console.log('cah_bl ', cash_balance);
        // console.log('val ', val);
        // console.log('prime ', prime);
        cash_balance += val;
        // console.log('cah_bl_new ', cash_balance);
        usr
          .save({cash_balance: cash_balance}, {patch: true})
          .then(function(usr) {
            new CashTransactions()
              .save({
                user_id: uid,
                details: 'Cash Credit for winning match #' + match_id,
                qty: val
              })
              .then(function(o) {})
              .catch(function(err) {
                console.log(8, err);
              });
          })
          .catch(function(err) {
            console.log(9, err);
          });
      }
    })
    .catch(function(err) {
      console.log(10, err);
    });
};

const takeMoneyFromMember = function(uid, input_val, match_id) {
  // console.log(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get('cash_balance');

        // console.log(cash_balance);
        cash_balance -= parseFloat(input_val);

        // console.log(cash_balance);
        usr
          .save({cash_balance: cash_balance}, {patch: true})
          .then(function(usr) {
            new CashTransactions()
              .save({
                user_id: uid,
                details: 'Cash Debit for joining match #' + match_id,
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

const giveXPtoTeam = function(team_id, players, match_id) {
  for (let i = players.length - 1; i >= 0; i--) {
    const uid = parseInt(players[i]);
    giveXpToMember(uid, match_id);
  }
};

const takeXPfromTeam = function(team_id, players, match_id) {
  for (let i = players.length - 1; i >= 0; i--) {
    const uid = parseInt(players[i]);
    takeXpFromMember(uid, match_id);
  }
};

const giveMoneyBackToTeam = function(
  team_id,
  input_val,
  team_members,
  match_id
) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    giveMoneyToMember(parseInt(team_members[i]), input_val, match_id);
  }
};

const takeMoneyFromTeam = function(team_id, input_val, team_members, match_id) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    takeMoneyFromMember(parseInt(team_members[i]), input_val, match_id);
  }
};

const addScoreForTeam = function(game_id, ladder_id, type, team_members) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    addScoreForMember(parseInt(team_members[i]), ladder_id, type);
  }
};

exports.saveScore = function(req, res, next) {
  new Item({id: req.body.id})
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
          msg: 'Match Data doesnt exist'
        });
        return;
      }

      if (val.team_1_result && val.team_2_result) {
        if (val.team_1_result != val.team_2_result) {
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
        // console.log(
        // 'pehle se result koi b ni posted, first time post ho rha h but lose dala h khud ka toh close match'
        // );
        const winner = false;
        // console.log(val);
        if (val.team_1_result) {
          const tmp = val.team_1_result.split('-');
          if (parseInt(tmp[0]) < parseInt(tmp[1])) {
            val.result = 'team_2';
            val.team_2_result = val.team_1_result;
            val.status = 'complete';
          }
        } else if (val.team_2_result) {
          const tmp = val.team_2_result.split('-');
          if (parseInt(tmp[0]) > parseInt(tmp[1])) {
            val.result = 'team_1';
            val.team_1_result = val.team_2_result;
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

          if (val.result == 'team_1' || val.result == 'team_2') {
            // let t_1_p = match.get('team_1_players');
            // t_1_p = t_1_p.split('|');

            // let t_2_p = match.get('team_2_players');
            // t_2_p = t_2_p.split('|');
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

            // giveWinToTeam(award_team_id,win_team_members,  tmp_match.id);
            giveXPtoTeam(award_team_id, win_team_members, tmp_match.id);
            takeXPfromTeam(loose_team_id, loose_team_members, tmp_match.id);

            if (tmp_match.match_type == 'paid') {
              // console.log('paid match giving xp');
              giveMoneyBackToTeam(
                award_team_id,
                tmp_match.match_fee,
                win_team_members,
                tmp_match.id
              );
            }
            // console.log('score resotlo');
            addScoreForTeam(
              tmp_match.game_id,
              tmp_match.ladder_id,
              'wins',
              win_team_members
            );
            addScoreForTeam(
              tmp_match.game_id,
              tmp_match.ladder_id,
              'loss',
              loose_team_members
            );
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

exports.join = function(req, res, next) {
  if (!req.body.using_users) {
    res.status(400).send({ok: false, msg: 'Please select team players'});
  }

  if (!req.body.team_2_id) {
    res.status(400).send({ok: false, msg: 'Please enter Team ID'});
  }
  if (!req.body.match_id) {
    res.status(400).send({ok: false, msg: 'Please enter Match ID'});
  }
  new Item({id: req.body.match_id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: "Match doesn't exist"
        });
        return;
      }
      match
        .save({
          team_2_id: req.body.team_2_id,
          status: 'accepted',
          team_2_players: req.body.using_users
            ? req.body.using_users.join('|')
            : ''
        })
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Joined successfully.',
            match: match.toJSON()
          });

          if (match.get('match_type') != 'free') {
            takeMoneyFromTeam(
              req.body.team_2_id,
              match.get('match_fee'),
              req.body.using_users,
              match.id
            );
          }

          for (let i = req.body.using_users.length - 1; i >= 0; i--) {
            new Notif()
              .save({
                user_id: req.body.using_users[i],
                description: 'You have a pending match',
                type: 'match',
                object_id: match.id
              })
              .then(function() {})
              .catch(function(er) {
                console.log(er);
              });
          }

          let team_1_users = match.get('team_1_players');
          team_1_users = team_1_users.split('|');
          for (let i = team_1_users.length - 1; i >= 0; i--) {
            new Notif()
              .save({
                user_id: parseInt(team_1_users[i]),
                description: 'A team has joined the match',
                type: 'match',
                object_id: match.id
              })
              .then(function() {})
              .catch(function(er) {
                console.log(er);
              });
          }
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Join the match'
          });
        });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Join the match'
      });
    });
};

exports.addItem = function(req, res, next) {
  req.assert('team_1_id', 'Team cannot be blank').notEmpty();
  req.assert('match_starts_in', 'Starts At cannot be blank').notEmpty();
  req.assert('match_type', 'Match Type cannot be blank').notEmpty();
  req.assert('match_players', 'Match Players cannot be blank').notEmpty();
  req.assert('using_users', 'Match Players cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  let starts_at = req.body.match_starts_in;
  starts_at = starts_at.split('|');
  new Item({
    team_1_id: req.body.team_1_id,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: moment().add(starts_at[0], starts_at[1]),
    match_type: req.body.match_type,
    match_players: req.body.match_players,
    match_fee: req.body.match_fee,
    team_1_players: req.body.using_users.join('|')
  })
    .save()
    .then(function(item) {
      res.send({
        ok: true,
        msg: 'New Match has been created successfully.',
        match: item.toJSON()
      });
      if (req.body.match_type == 'paid') {
        takeMoneyFromTeam(
          req.body.team_1_id,
          req.body.match_fee,
          req.body.using_users,
          item.id
        );
      }
      for (let i = req.body.using_users.length - 1; i >= 0; i--) {
        new Notif()
          .save({
            user_id: req.body.using_users[i],
            description: 'You have a pending match',
            type: 'match',
            object_id: item.id
          })
          .then(function() {})
          .catch(function(er) {
            console.log(er);
          });
      }
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.matches_of_team = function(req, res, next) {
  new Item()
    .orderBy('created_at', 'DESC')

    .query(function(qb) {
      qb.where('team_1_id', req.query.team_id).orWhere(
        'team_2_id',
        req.query.team_id
      );
    })
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info', 'team_2_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.matches_of_user = function(req, res, next) {
  const teams = req.query.teams.split(',');
  new Item()
    .orderBy('created_at', 'DESC')

    .query(function(qb) {
      qb.where('team_1_id', 'in', teams).orWhere('team_2_id', 'in', teams);
    })
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info', 'team_2_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listupcoming = function(req, res, next) {
  let a = new Item()
    .orderBy('game_id', 'DESC')
    // .orderBy('created_at', 'DESC')
    .where('starts_at', '>', moment());

  if (req.query.filter_id) {
    a = a.where({
      game_id: req.query.filter_id
    });
  }

  a.fetchAll({withRelated: ['ladder', 'game', 'team_1_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      item = item.toJSON();

      const games_obj = {};
      for (let i = item.length - 1; i >= 0; i--) {
        if (!games_obj['game_' + item[i].game_id]) {
          games_obj['game_' + item[i].game_id] = [];
        }
        games_obj['game_' + item[i].game_id].push(item[i]);
      }

      return res.status(200).send({ok: true, items: games_obj});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listItem = function(req, res, next) {
  new Item()
    // .where('id', req.params.id)
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, items: []});
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
      console.log(err);
      return res.status(200).send([]);
    });
};

exports.listSingleItem = function(req, res, next) {
  new Item()
    .where('id', req.params.id)
    .fetch({
      withRelated: [
        'ladder',
        'game',
        'team_1_info',

        'team_1_info.team_users',
        'team_1_info.team_users.user_info',
        'team_2_info',

        'team_2_info.team_users',
        'team_2_info.team_users.user_info'
      ]
    })
    .then(function(item) {
      if (!item) {
        return res.status(200).send({id: req.params.id});
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
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
