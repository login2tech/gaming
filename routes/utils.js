const User = require('../models/User');
const CashTransactions = require('../models/CashTransactions');
const CreditTransactions = require('../models/CreditTransactions');

const giveCashOrCreditsToUser = function(typ, user_id, amount, descr, obj) {
  new User()
    .where({id: user_id})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let typ_balance = usr.get(typ);

        typ_balance = parseFloat(typ_balance) + parseFloat(amount);
        typ_balance = typ_balance.toFixed(2);

        usr
          .save({[typ]: typ_balance}, {patch: true})
          .then(function(usr) {
            let ct;
            if (typ == 'cash_balance') {
              ct = new CashTransactions();
            } else {
              ct = new CreditTransactions();
            }

            return ct
              .save({
                user_id: user_id,
                obj_type: obj,
                details: descr,
                qty: amount
              })
              .then(function(o) {
                //
              })
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

const takeCashOrCreditsFromUser = function(typ, user_id, amount, descr, obj) {
  new User()
    .where({id: user_id})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let typ_balance = usr.get(typ);
        typ_balance = parseFloat(typ_balance) - parseFloat(amount);
        typ_balance = typ_balance.toFixed(2);

        usr
          .save({[typ]: typ_balance}, {patch: true})
          .then(function(usr) {
            let ct;
            if (typ == 'cash_balance') {
              ct = new CashTransactions();
            } else {
              ct = new CreditTransactions();
            }

            ct.save({
              user_id: user_id,
              obj_type: obj,
              details: descr,
              qty: -amount
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

exports.giveCreditsToUser = function(user_id, amount, descr, obj) {
  const typ = 'credit_balance';
  giveCashOrCreditsToUser(typ, user_id, amount, descr, obj);
};

exports.giveCashToUser = function(user_id, amount, descr, obj) {
  const typ = 'cash_balance';
  giveCashOrCreditsToUser(typ, user_id, amount, descr, obj);
};

exports.takeCreditsFromUser = function(user_id, amount, descr, obj) {
  const typ = 'credit_balance';
  takeCashOrCreditsFromUser(typ, user_id, amount, descr, obj);
};

exports.takeCashFromUser = function(user_id, amount, descr, obj) {
  const typ = 'cash_balance';
  takeCashOrCreditsFromUser(typ, user_id, amount, descr, obj);
};
