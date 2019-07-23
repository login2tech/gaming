const CashTransactions = require('../models/CashTransactions');
const CreditTransactions = require('../models/CreditTransactions');
const XPTransactions = require('../models/XPTransactions');

exports.list = function(req, res, next) {
  new CashTransactions()
    .where({user_id: req.user.id})
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(cash_transactions) {
      new CreditTransactions()
        .where({user_id: req.user.id})
        .orderBy('id', 'DESC')
        .fetchAll()
        .then(function(credit_transactions) {
          new XPTransactions()
            .where({user_id: req.user.id})
            .orderBy('id', 'DESC')
            .fetchAll()
            .then(function(xp_transactions) {
              return res.status(200).send({
                ok: true,
                cash_transactions: cash_transactions.toJSON(),
                xp_transactions: xp_transactions.toJSON(),
                credit_transactions: credit_transactions.toJSON()
              });
            })
            .catch(function(err) {
              return res.status(200).send({
                ok: true,
                cash_transactions: cash_transactions.toJSON(),
                xp_transactions: [],
                credit_transactions: credit_transactions.toJSON()
              });
            });
        })
        .catch(function(err) {
          return res.status(200).send({
            ok: true,
            cash_transactions: cash_transactions.toJSON(),
            xp_transactions: [],
            credit_transactions: []
          });
        });
      // return res.status(200).send({ok: true, notifs: notifs.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send({
        ok: false,
        cash_transactions: [],
        xp_transactions: [],
        credit_transactions: []
      });
    });
};

// exports.listMine = function(req, res, next) {
//   new Notification()
//     .where({
//       user_id: req.user.id
//     })
//     .orderBy('id', 'DESC')
//     .fetchAll()
//     .then(function(notifs) {
//       if (!notifs) {
//         return res.status(200).send([]);
//       }
//       return res.status(200).send({ok: true, notifs: notifs.toJSON()});
//     })
//     .catch(function(err) {
//       return res.status(200).send([]);
//     });
// };

// exports.delete = function(req, res, next) {
//   new Notification()

//     .where({
//       user_id : req.user.id
//     })
//     .destroy()
//     .then(function(user) {
//       // res.send({msg: ''});
//       res.redirect('/notifications');
//     })
//     .catch(function(err) {
//       console.log(err);
//       res.redirect('/notifications');
//       // return res.status(400).send({msg: ''});
//     });
// };
