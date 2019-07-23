const Item = require('./Money8Match');

const User = require('../../models/User');

const Notif = require('../../models/Notification');
const XP = require('../../models/XP');
const CashTransactions = require('../../models/CashTransactions');
const CreditTransactions = require('../../models/CreditTransactions');
const XPTransactions = require('../../models/XPTransactions');
const Score = require('../../models/Score');

const shuffle = function(array) {
  array.sort(() => Math.random() - 0.5);
};

// const giveMoneyToMember = function(uid, input_val) {
//   new User()
//     .where({id: uid})
//     .fetch()
//     .then(function(usr) {
//       if (usr) {
//         let cash_balance = usr.get('cash_balance');
//         const prime = usr.get('prime');
//         if (prime) {
//           cash_balance += parseFloat(input_val);
//         } else {
//           cash_balance += parseFloat((4 / 5) * input_val);
//         }

//         usr
//           .save({cash_balance: cash_balance}, {patch: true})
//           .then(function(usr) {})
//           .catch(function(err) {
//             // console.log(err);
//           });
//       }
//     })
//     .catch(function(err) {
//       // console.log(err);
//     });
// };

const takeMoneyFromMember = function(uid, input_val, type, match_id) {
  console.log('taking money now: ', input_val);
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

// exports.saveScore = function(req, res, next) {
//   new Item({id: req.body.id})
//     .fetch()
//     .then(function(match) {
//       if (!match) {
//         res.status(400).send({
//           ok: false,
//           msg: 'Match doesnt exist'
//         });
//         return;
//       }
//       const val = req.body;
//       const tmp_match = match.toJSON();
//       if (tmp_match.team_1_result && tmp_match.team_2_result) {
//         return res.status(400).send({ok: false, msg: 'Result already saved'});
//       }
//       if (val.team_1_result && tmp_match.team_2_result) {
//         val.team_2_result = tmp_match.team_2_result;
//       } else if (val.team_2_result && tmp_match.team_1_result) {
//         val.team_1_result = tmp_match.team_1_result;
//       }
//       if (!val.team_1_result && !val.team_2_result) {
//         res.status(400).send({
//           ok: false,
//           msg: 'Match Data doesnt exist'
//         });
//         return;
//       }
//       // console.log(val);
//       if (val.team_1_result != '' && val.team_2_result != '') {
//         if (val.team_1_result != val.team_2_result) {
//           val.status = 'disputed';
//           val.result = 'disputed';
//         } else {
//           const tmp = val.team_1_result.split('-');
//           if (parseInt(tmp[0]) > parseInt(tmp[1])) {
//             val.result = 'team_1';
//             val.status = 'Complete';
//           } else if (parseInt(tmp[1]) > parseInt(tmp[0])) {
//             val.result = 'team_2';
//             val.status = 'Complete';
//           } else {
//             val.status = 'tie';
//             val.result = 'Tie';
//           }
//         }
//       }
//       //console.log(val);
//       match
//         .save(val)
//         .then(function(match) {
//           res.status(200).send({
//             ok: true,
//             msg: 'Score Updated successfully.',
//             match: match.toJSON()
//           });

//           if (val.result == 'team_1' || val.result == 'team_2') {
//             const award_team_id =
//               val.result == 'team_1'
//                 ? tmp_match.team_1_id
//                 : tmp_match.team_2_id;
//             giveXPtoTeam(award_team_id);
//             if (tmp_match.match_type == 'paid') {
//               giveMoneyBackToTeam(award_team_id, tmp_match.match_fee);
//             }
//           }
//         })
//         .catch(function(err) {
//           // console.log(err);
//           res.status(400).send({
//             ok: false,
//             msg: 'Failed to Save Score'
//           });
//         });
//     })
//     .catch(function(err) {
//       // console.log(err);
//       res.status(400).send({
//         ok: false,
//         msg: 'Failed to Save Score'
//       });
//     });
// };

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
            if (saved_team_1_array.indexOf(""+dummy_players[i]) > -1) {
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
  new Item({
    match_type: req.body.match_type,
    players_total: req.body.players_total,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
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
