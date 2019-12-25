// Libraries
require('dotenv').config({silent: true});
const moment = require('moment');
const utils = require('./routes/utils');

const plan_prices = {
  gold: 6.99,
  silver: 4.99
};
// Models
const User = require('./models/User');

let TICKER = 0;
function reset_ticker() {
  // console.log('reseting..')
  TICKER = 0;
}

const stopDoubleXp = function(ta) {
  new User()
    .where({id: ta})
    .save(
      {
        double_xp: false,
        double_xp_obj: '{}'
      },
      {patch: true, method: 'update'}
    )
    .then(function(d) {
      //
    })
    .catch(function(err) {
      console.log(err);
    });
};

const checkForMembership = function(user) {
  const prime_obj = user.prime_obj;
  const obj_to_save = {};
  if (prime_obj.bought_type == 'Stripe') {
    // let  it happen with stripe's webhooks
  } else {
    if (prime_obj.cancel_requested) {
      obj_to_save.prime = false;
      obj_to_save.prime_obj = {};
      obj_to_save.prime_type = '';
      new User()
        .where({id: user.id})
        .save(obj_to_save, {method: 'update'})
        .then(function(usr) {
          //
        })
        .catch(function(err) {
          //
        });
    } else {
      const cost_of_prime = plan_prices[user.plan_type];
      if (user.cash_balance > cost_of_prime) {
        // cash balance hai.. lets renew
        utils.takeCashFromUser(
          user.id,
          cost_of_prime,
          'Renewing membership via OCG Cash',
          ''
        );
        obj_to_save.prime_obj = user.prime_obj;
        obj_to_save.prime_obj.next_renew = moment(
          user.prime_obj.next_renew
        ).add(1, 'month');
        new User()
          .where({id: user.id})
          .save(obj_to_save, {method: 'update'})
          .then(function(usr) {
            //
          })
          .catch(function(err) {
            //
          });
      } else {
        // cash balance ni hai.. lets stop.
        obj_to_save.prime = false;
        obj_to_save.prime_obj = {};
        obj_to_save.prime_type = '';
        new User()
          .where({id: user.id})
          .save(obj_to_save, {method: 'update'})
          .then(function(usr) {
            //
          })
          .catch(function(err) {
            //
          });
      }
    }
  }
};
new User()
  .where('double_xp', true)
  .where('double_xp_exp', '<', moment())
  .fetchAll()
  .then(function(usrs) {
    reset_ticker();
    if (!usrs) {
      return;
    }
    usrs = usrs.toJSON();
    // console.log(matches.length);
    for (let i = 0; i < usrs.length; i++) {
      // `
      // tournaments`
      //
      stopDoubleXp(usrs[i].id);
    }
    //
  })
  .catch(function(err) {
    console.log(err);
  });
new User()
  .where({
    prime: true
  })
  .where('prime_exp', '<', moment())
  .fetchAll()
  .then(function(usrs) {
    reset_ticker();
    if (!usrs) {
      return;
    }
    usrs = usrs.toJSON();
    for (let i = 0; i < usrs.length; i++) {
      checkForMembership(usrs[i].id);
    }
  });
setInterval(function() {
  console.log('.');
  if (TICKER > 0) {
    process.exit(); // we need to exit the task if there is no activity(completed)
  }
  TICKER++;
}, 5000);
