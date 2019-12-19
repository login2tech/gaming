const moment = require('moment');
const Item = require('./Money8Match');

const User = require('../../models/User');

const Notif = require('../../models/Notification');
const XP = require('../../models/XP');
const CashTransactions = require('../../models/CashTransactions');
const CreditTransactions = require('../../models/CreditTransactions');
const XPTransactions = require('../../models/XPTransactions');
const Score = require('../../models/Score');
const utils = require('../utils');
const shuffle = function(array) {
  array.sort(() => Math.random() - 0.5);
};

const getXPBasedOn = function(current_xp) {
  return 15;
};
const getXPRemoveBasedOn = function(current_xp) {
  return 7;
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
                obj_type: 'm8_' + match_id,
                details: 'XP Credit for winning money-8 match #' + match_id,
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
//
const takeXpFromMember = function(uid, match_id) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let xp = usr.get('life_xp');
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
                obj_type: 'm8_' + match_id,
                details: 'XP Debit for losing money-8 match #' + match_id,
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

const addScoreForMember = function(uid, ladder_id, game_id, type) {
  console.log('73');
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
            game_id: game_id,
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
            game_id: game_id,
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

const giveMoneyToMember = function(uid, input_val, match_id, type) {
  let typ = '';
  if (type == 'cash' || type == 'cash_balance') {
    typ = 'cash_balance';
  } else if (
    type == 'credit' ||
    type == 'credit_balance' ||
    type == 'credits'
  ) {
    typ = 'credit_balance';
  }
  console.log('match_fee is: ', input_val, typ);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get(typ);
        let life_earning = usr.get('life_earning');

        const prime = usr.get('prime');
        let val;

        if (prime) {
          val = parseFloat(input_val) + parseFloat(input_val);
          if (typ == 'cash_balance') {
            life_earning += parseFloat(input_val);
          }
        } else {
          val =
            parseFloat((4 / 5) * parseFloat(input_val)) + parseFloat(input_val);
          if (typ == 'cash_balance') {
            life_earning += parseFloat(input_val);
          }
        }
        console.log('cah_bl ', cash_balance);
        console.log('val ', val);
        console.log('prime ', prime);
        cash_balance += val;
        console.log('cah_bl_new ', cash_balance);
        usr
          .save(
            {[typ]: cash_balance, life_earning: life_earning},
            {patch: true}
          )
          .then(function(usr) {
            let ct;
            if (typ == 'cash_balance') {
              ct = new CashTransactions();
            } else {
              ct = new CreditTransactions();
            }

            ct.save({
              user_id: uid,
              obj_type: 'm8_' + match_id,
              details: 'Credit for winning money-8 match #' + match_id,
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

const takeMoneyFromMember = function(uid, input_val, type, match_id) {
  // console.log(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        console.log('got the user: ');
        let obj;
        console.log(obj);
        console.log(type);
        if (type == 'cash') {
          let cash_balance = usr.get('cash_balance');
          cash_balance -= parseFloat(input_val);
          obj = {cash_balance: cash_balance};
        } else if (type == 'credits') {
          let credit_balance = usr.get('credit_balance');
          credit_balance -= parseFloat(input_val);
          obj = {credit_balance: credit_balance};
        }
        console.log(obj);
        usr
          .save(obj, {patch: true})
          .then(function(usr) {
            console.log('saved');
            let ct;
            if (type == 'cash') {
              ct = new CashTransactions();
            } else {
              ct = new CreditTransactions();
            }
            if (ct) {
              ct.save({
                user_id: uid,
                obj_type: 'm8_' + match_id,
                details: type + ' Debit for joining money-8 match #' + match_id,
                qty: -parseFloat(input_val)
              })
                .then(function(o) {})
                .catch(function(err) {
                  console.log(4, err);
                });
            }
          })
          .catch(function(err) {
            console.log('failed to save');
            console.log(err);
          });
      }
    })
    .catch(function(err) {
      console.log(err);
      console.log('failed to fetch');
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
  match_id,
  type
) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    giveMoneyToMember(parseInt(team_members[i]), input_val, match_id, type);
  }
};

const addScoreForTeam = function(game_id, ladder_id, type, team_members) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    addScoreForMember(parseInt(team_members[i]), ladder_id, game_id, type);
  }
};

exports.resolveDispute = function(req, res, next) {
  console.log(req.body);
  new Item({id: req.body.id})
    .fetch()
    .then(function(match) {
      if (!match) {
        return res.status(400).send({
          ok: false,
          msg: "Match doesn't exist"
        });
      }
      const tmp_match = match.toJSON();
      if (tmp_match.result != 'disputed') {
        return res.status(400).send({
          ok: false,
          msg: 'Match not disputed'
        });
      }
      const final_result = req.body.winner;
      if (final_result != 'team_1' && final_result != 'team_2') {
        return res.status(400).send({
          ok: false,
          msg: 'Thats not a valid result'
        });
      }
      const saved_info = {
        status: 'complete',
        result: final_result
      };

      match
        .save(saved_info, {method: 'update'})
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Dispute resolved successfully',
            match: match.toJSON()
          });

          let win_team_members;
          let loose_team_members;
          if (final_result == 'team_1') {
            win_team_members = match.get('team_1');
            loose_team_members = match.get('team_2');
          } else {
            win_team_members = match.get('team_2');
            loose_team_members = match.get('team_1');
          }

          win_team_members = win_team_members.split('|').map(function(a) {
            return parseInt(a);
          });
          loose_team_members = loose_team_members.split('|').map(function(a) {
            return parseInt(a);
          });

          giveXPtoTeam(null, win_team_members, tmp_match.id);
          takeXPfromTeam(null, loose_team_members, tmp_match.id);

          if (
            tmp_match.match_type == 'cash' ||
            tmp_match.match_type == 'credits'
          ) {
            // console.log('paid match giving xp');
            giveMoneyBackToTeam(
              null,
              tmp_match.match_fee,
              win_team_members,
              tmp_match.id,
              tmp_match.match_type
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
        })
        .catch(function(err) {
          console.log('1');
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to resolve the dispute'
          });
        });
    })
    .catch(function(err) {
      console.log('2');
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to resolve dispute'
      });
    });
};

exports.saveScore = function(req, res, next) {
  console.log(req.body);
  new Item({id: req.body.id})
    .fetch()
    .then(function(match) {
      if (!match) {
        return res.status(400).send({
          ok: false,
          msg: "Match doesn't exist"
        });
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
            let win_team_members;
            let loose_team_members;
            if (val.result == 'team_1') {
              win_team_members = match.get('team_1');
              loose_team_members = match.get('team_2');
            } else {
              win_team_members = match.get('team_2');
              loose_team_members = match.get('team_1');
            }
            // console.log('winers are ', win_team_members);
            // console.log('lossers are ', loose_team_members);

            win_team_members = win_team_members.split('|');
            loose_team_members = loose_team_members.split('|');

            giveXPtoTeam(null, win_team_members, tmp_match.id);
            takeXPfromTeam(null, loose_team_members, tmp_match.id);

            if (
              tmp_match.match_type == 'cash' ||
              tmp_match.match_type == 'credits'
            ) {
              // console.log('paid match giving xp');
              giveMoneyBackToTeam(
                null,
                tmp_match.match_fee,
                win_team_members,
                tmp_match.id,
                tmp_match.match_type
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

exports.leave = function(req, res, next) {
  if (!req.body.match_id) {
    res.status(400).send({ok: false, msg: 'Please enter Match ID'});
    return;
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
      const players_total = match.get('players_total');
      const players_joined = match.get('players_joined');

      if (players_total <= players_joined) {
        res.status(400).send({
          ok: false,
          msg: 'Pool is already full. You can not leave now.'
        });
        return;
      }

      let players = match.get('players');
      if (!players) {
        players = '[]';
      }
      console.log(players);

      players = JSON.parse(players);
      console.log(players);
      if (players.indexOf(req.user.id) > -1) {
        players.splice(players.indexOf(req.user.id), 1);
        // players_joined -= 1;

        const obj = {
          players: JSON.stringify(players),
          players_joined: players_joined - 1
        };
        match
          .save(obj)
          .then(function(match) {
            match = match.toJSON();
            res.status(200).send({
              ok: true,
              msg: 'Left successfully.',
              match: match
            });

            if (match.match_type == 'cash') {
              utils.giveCashToUser(
                req.user.id,
                match.match_fee,
                'Refund for leaving mix & match #' + match.id,
                'm8_' + match.id
              );
            } else if (match.match_type == 'credits') {
              utils.giveCreditsToUser(
                req.user.id,
                match.match_fee,
                'Refund for leaving mix & match #' + match.id,
                'm8_' + match.id
              );
            }
          })
          .catch(function(err) {
            console.log(err);
            res.status(400).send({
              ok: false,
              msg: 'Left successfully.'
            });
          });
      } else {
        res.status(400).send({
          ok: false,
          msg: 'You have already not a part of this pool'
        });
        return;
      }
      // players joined is less than players_total;
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to fetch match'
      });
    });
};

exports.join = function(req, res, next) {
  if (!req.body.match_id) {
    res.status(400).send({ok: false, msg: 'Please enter Match ID'});
    return;
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
      const players_total = match.get('players_total');
      let players_joined = match.get('players_joined');

      if (players_total <= players_joined) {
        res.status(400).send({
          ok: false,
          msg: 'Pool is already full'
        });
        return;
      }

      let players = match.get('players');
      if (!players) {
        players = '[]';
      }

      players = JSON.parse(players);

      if (players.indexOf(req.user.id) > -1) {
        res.status(400).send({
          ok: false,
          msg: 'You have already joined the pool'
        });
        return;
      }
      players.push(req.user.id);
      players_joined += 1;
      const obj = {
        players: JSON.stringify(players),
        players_joined: players_joined
      };

      if (players_joined == players_total) {
        obj.status = 'started';

        const dummy_players = JSON.parse(JSON.stringify(players));

        const saved_team_1 = match.get('team_1');
        let team_1;
        let team_2;
        if (!saved_team_1) {
          console.log('original players list:  ', dummy_players);
          shuffle(dummy_players);
          console.log('shuffled players list:  ', dummy_players);
          team_1 = [];
          team_2 = [];

          const in_1_team = players_total / 2;

          for (let i = 0; i < dummy_players.length; i++) {
            const plyr = dummy_players[i];
            if (i < in_1_team) {
              team_1.push(plyr);
            } else {
              team_2.push(plyr);
            }
          }
        } else {
          const saved_team_1_array = saved_team_1.split('|');
          team_1 = saved_team_1_array;
          team_2 = [];
          // console.log(saved_team_1_array, )
          for (let i = 0; i < dummy_players.length; i++) {
            const plyr = dummy_players[i];
            if (saved_team_1_array.indexOf('' + dummy_players[i]) > -1) {
              //
            } else {
              team_2.push(plyr);
            }
          }
        }

        obj.team_1 = team_1.join('|');
        obj.team_2 = team_2.join('|');
      }

      match
        .save(obj)
        .then(function(match) {
          match = match.toJSON();
          res.status(200).send({
            ok: true,
            msg: 'Joined successfully.',
            match: match
          });

          if (match.match_type != 'free') {
            takeMoneyFromMember(
              req.user.id,
              match.match_fee,
              match.match_type,
              match.id
            );
          }
          new Notif()
            .save({
              user_id: req.user.id,
              description: 'You have a pending money-8 match',
              type: 'money-8',
              object_id: match.id
            })
            .then(function() {
              return 0;
            })
            .catch(function(er) {
              console.log(er);
            });
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to join match'
          });
        });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to fetch match'
      });
    });
};

exports.addItem = function(req, res, next) {
  req.assert('match_type', 'Match Type cannot be blank').notEmpty();
  req.assert('players_total', 'Total Player Count cannot be blank').notEmpty();
  req.assert('game_id', 'Game Id cannot be blank').notEmpty();
  req.assert('ladder_id', 'Ladder id cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  let expires_in = req.body.expires_in;

  expires_in = expires_in.split('|');
  new Item({
    match_type: req.body.match_type,
    players_total: req.body.players_total,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    expires_in: moment().add(expires_in[0], expires_in[1]),
    players: JSON.stringify([req.user.id]),
    match_fee: req.body.match_fee
  })
    .save()
    .then(function(item) {
      res.send({
        ok: true,
        msg: 'New Item has been created successfully.',
        match: item.toJSON()
      });
      if (req.body.match_type != 'free') {
        takeMoneyFromMember(
          req.user.id,
          req.body.match_fee,
          req.body.match_type,
          item.id
        );
      }
      new Notif()
        .save({
          user_id: req.user.id,
          description: 'You have a pending money-8 match',
          type: 'money-8',
          object_id: item.id
        })
        .then(function() {
          return 0;
        })
        .catch(function(er) {
          console.log(er);
        });
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.listItem = function(req, res, next) {
  new Item()
    .fetchAll({withRelated: ['ladder', 'game']})
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
      // console.log(err)
      return res.status(200).send([]);
    });
};

exports.listSingleItem = function(req, res, next) {
  new Item()
    .where('id', req.params.id)
    .fetch({
      withRelated: ['ladder', 'game']
    })
    .then(function(item) {
      if (!item) {
        return res.status(200).send({id: req.params.id});
      }
      item = item.toJSON();
      let players = item.players;
      players = JSON.parse(players);
      // console.log(players, players.length);
      if (players.length) {
        new User()
          .where('id', 'in', players)
          .fetchAll()
          .then(function(players) {
            item.players_obj = players.toJSON();
            return res.status(200).send({ok: true, item: item});
          })
          .catch(function(err) {
            // console.log(err);
            return res.status(200).send({ok: true, item: item});
          });
      } else {
        return res.status(200).send({ok: true, item: item});
      }
    })
    .catch(function(err) {
      // console.log(err);
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
    .where('status', 'pending')
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

exports.matchesForUser = function(req, res, next) {
  const uid = req.user.id;
  new Item()
    .orderBy('created_at', 'DESC')
    .query(function(qb) {
      qb.where('players', 'LIKE', '[' + uid + '%')
        .orWhere('players', 'LIKE', '%,' + uid + ',%')
        .orWhere('players', 'LIKE', '%' + uid + ']');
    })
    .fetchPage({page: req.query.page ? req.query.page : 1, pageSize: 5})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res
        .status(200)
        .send({ok: true, items: item.toJSON(), pagination: item.pagination});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};
