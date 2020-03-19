const User = require('../models/User');
const CashTransactions = require('../models/CashTransactions');
const CreditTransactions = require('../models/CreditTransactions');
const Raven = require('raven');
const moment = require('moment');
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
                qty: amount,
                balance :typ_balance
              })
              .then(function(o) {
                //
              })
              .catch(function(err) {
                Raven.captureException(err);
              });
          })
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
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
              qty: -amount,
              balance :typ_balance
            })
              .then(function(o) {})
              .catch(function(err) {
                Raven.captureException(err);
              });
          })
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
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

exports.get_current_season = function() {
  const today = moment();
  let cur_year = today.format('YYYY');
  cur_year = '' + cur_year;
  const next_year = parseInt(cur_year) + 1;
  if (today.isBetween(cur_year + '-03-19', cur_year + '-06-20', null, '[]')) {
    return [parseInt(cur_year), 1];
  } else if (
    today.isBetween(cur_year + '-06-20', cur_year + '-09-22', null, '[]')
  ) {
    return [parseInt(cur_year), 2];
  } else if (
    today.isBetween(cur_year + '-09-22', cur_year + '-12-21', null, '[]')
  ) {
    return [parseInt(cur_year), 3];
  } else if (
    today.isBetween(cur_year + '-12-21', next_year + '-03-19', null, '[]')
  ) {
    return [parseInt(cur_year), 4];
  } else if (today.isBefore(cur_year + '-03-19', 'YYYY-MM-DD')) {
    if (cur_year - 1 == 2019) {
      return [2020, 1];
    }
    return [parseInt(cur_year) - 1, 4];
  }
};
