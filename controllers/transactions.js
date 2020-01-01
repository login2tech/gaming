const CashTransactions = require('../models/CashTransactions');
const CreditTransactions = require('../models/CreditTransactions');
const XPTransactions = require('../models/XPTransactions');

exports.list = function(req, res, next) {
  const pg = req.query.page ? req.query.page : 1;
  let mdl;
  if (req.query.type == 'cash') {
    mdl = new CashTransactions();
  } else if (req.query.type == 'credit') {
    mdl = new CreditTransactions();
  } else {
    mdl = new XPTransactions();
  }
  mdl
    .where({user_id: req.user.id})
    .orderBy('id', 'DESC')
    .fetchPage({page: pg, pageSize: 5})
    .then(function(items) {
      //
      return res.status(200).send({
        ok: true,
        items: items.toJSON(),
        pagination: items.pagination
      });
    })
    .catch(function(err) {
      return res.status(200).send({
        ok: true,
        items: []
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
