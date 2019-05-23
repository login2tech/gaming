// const fs = require('fs');
// const moment = require('moment');

const Item = require('./Money8Match');
// const TeamUser = require('../teams/TeamUser');
const User = require('../../models/User');
// const ObjName = 'Match';

// const getXPBasedOn = function(current_xp) {
//   return 10;
// };

// const giveXpToMember = function(uid, input_val) {
//   // return; //  removed temporarily
//   new User()
//     .where({id: uid})
//     .fetch()
//     .then(function(usr) {
//       if (usr) {
//         let xp = usr.get('life_xp');
//         const double_xp = usr.get('double_xp');
//         const xP_to_add = getXPBasedOn(xp);
//         xp += xP_to_add;
//         if (double_xp) {
//           xp += xP_to_add;
//         }
//         usr
//           .save({life_xp: xp})
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

const giveMoneyToMember = function(uid, input_val) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get('cash_balance');
        const prime = usr.get('prime');
        if (prime) {
          cash_balance += parseFloat(input_val);
        } else {
          cash_balance += parseFloat((4 / 5) * input_val);
        }

        usr
          .save({cash_balance: cash_balance}, {patch: true})
          .then(function(usr) {})
          .catch(function(err) {
            // console.log(err);
          });
      }
    })
    .catch(function(err) {
      // console.log(err);
    });
};

const takeMoneyFromMember = function(uid, input_val, type) {
  // console.log(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let obj;
        if (type == 'cash') {
          let cash_balance = usr.get('cash_balance');

          // console.log(cash_balance);
          cash_balance -= parseFloat(input_val);
          obj = {cash_balance: cash_balance};
        } else if (type == 'credit') {
          let credit_balance = usr.get('credit_balance');

          // console.log(cash_balance);
          credit_balance -= parseFloat(input_val);
          obj = {credit_balance: credit_balance};
        }
        usr
          .save(obj, {patch: true})
          .then(function(usr) {})
          .catch(function(err) {
            console.log(err);
          });
      }
    })
    .catch(function(err) {
      console.log(err);
    });
};

// exports.matches_of_user = function(req, res, next) {
//   const teams = req.query.teams.split(',');
//   // const uid = req.query.uid;
//   new Item()
//     .orderBy('created_at', 'DESC')
//
//     .query(function(qb) {
//       qb.where('team_1_id', 'in', teams).orWhere('team_2_id', 'in', teams);
//     })
//     .fetchAll({withRelated: ['ladder', 'game', 'team_1_info', 'team_2_info']})
//     .then(function(item) {
//       if (!item) {
//         return res.status(200).send({ok: true, items: []});
//       }
//       return res.status(200).send({ok: true, items: item.toJSON()});
//     })
//     .catch(function(err) {
//       // console.log(err);
//       return res.status(200).send({ok: true, items: []});
//     });
// };

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

exports.saveScore = function(req, res, next) {
  new Item({id: req.body.id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: 'Match doesnt exist'
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
      // console.log(val);
      if (val.team_1_result != '' && val.team_2_result != '') {
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
      //console.log(val);
      match
        .save(val)
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Score Updated successfully.',
            match: match.toJSON()
          });

          if (val.result == 'team_1' || val.result == 'team_2') {
            const award_team_id =
              val.result == 'team_1'
                ? tmp_match.team_1_id
                : tmp_match.team_2_id;
            giveXPtoTeam(award_team_id);
            if (tmp_match.match_type == 'paid') {
              giveMoneyBackToTeam(award_team_id, tmp_match.match_fee);
            }
          }
        })
        .catch(function(err) {
          // console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
    });
};

exports.join = function(req, res, next) {
  if (!req.body.match_id) {
    res.status(400).send({ok: false, msg: 'Please enter Match ID'});
  }
  new Item({id: req.body.match_id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: 'Match doesnt exist'
        });
        return;
      }
      // if( match.get())
      match
        .save({
          team_2_id: req.body.team_2_id,
          status: 'accepted'
        })
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Joined successfully.',
            match: match.toJSON()
          });

          if (match.get('match_type') != 'free') {
            takeMoneyFromTeam(req.body.team_2_id, match.get('match_fee'));
          }
        })
        .catch(function(err) {
          // console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
    });
};

exports.listItem = function(req, res, next) {
  new Item()
    // .where('id', req.params.id)
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
          req.body.match_type
        );
      }
    })
    .catch(function(err) {
      // console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};
