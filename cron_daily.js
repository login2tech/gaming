// Libraries
const Raven = require('raven');
Raven.config('https://a6c40c1f84954d8f92472d82355a10fe@sentry.io/1876355');
require('dotenv').config({silent: true});
const moment = require('moment');
const utils = require('./routes/utils');
const MembershipLog = require('./models/MembershipLog');
const addMembershipLog = function(plan, action, uid, reason) {
  let msg;
  if (action == 'add') {
    msg = 'OCG ' + plan + ' membership started.';
  } else if (action == 'renew') {
    msg = 'OCG ' + plan + ' membership renewed';
  } else if (action == 'stop_at_month_end') {
    msg = 'OCG' + plan + ' membership renewal cancelled';
  } else if (action == 'stop') {
    msg = 'OCG' + plan + ' membership expired';
    if (reason) {
      msg += ' [' + reason + ']';
    }
  }
  new MembershipLog().save({
    user_id: uid,
    descr: msg
  });
};
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
      Raven.captureException(err);
    });
};

const checkForMembership = function(user) {
  let prime_obj = user.prime_obj;
  let prime_obj_str = prime_obj;
  if(!prime_obj_str)
  {prime_obj_str = '';}else{
    prime_obj_str = prime_obj_str.toLowerCase();
  }
  let prime_type = user.prime_type;
  const obj_to_save = {};
  
  if (!prime_obj) {
    prime_obj = '{}';
  }
  prime_obj = JSON.parse(prime_obj);
    prime_type = prime_obj.prime_type;
  // }

  if (prime_obj.bought_type == 'Stripe' || prime_obj.bought_type == 'stripe' || prime_obj_str.indexOf('stripe') > -1) {
    // let  it happen with stripe's webhooks
    return;
  } else {
    if (prime_obj.cancel_requested) {
      obj_to_save.prime = false;
      obj_to_save.prime_obj = {};
      obj_to_save.prime_type = '';
      obj_to_save.pndng_uname_changes = 0;
      new User()
        .where({id: user.id})
        .save(obj_to_save, {method: 'update'})
        .then(function(usr) {
          addMembershipLog(
            prime_type,
            'stop',
            user.id,
            'Renewal was disabled by you.'
          );
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
        obj_to_save.pndng_uname_changes = 1;
        obj_to_save.prime_obj.next_renew = moment(
          user.prime_obj.next_renew
        ).add(1, 'month');
        new User()
          .where({id: user.id})
          .save(obj_to_save, {method: 'update'})
          .then(function(usr) {
            addMembershipLog(prime_type, 'renew', user.id);
          })
          .catch(function(err) {
            //
          });
      } else {
        // cash balance ni hai.. lets stop.
        obj_to_save.prime = false;
        obj_to_save.prime_obj = {};
        obj_to_save.prime_type = '';
        obj_to_save.pndng_uname_changes = 0;
        new User()
          .where({id: user.id})
          .save(obj_to_save, {method: 'update'})
          .then(function(usr) {
            addMembershipLog(
              prime_type,
              'stop',
              user.id,
              'Insufficient OCG Cash Balance'
            );
          })
          .catch(function(err) {
            Raven.captureException(err);
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
      stopDoubleXp(usrs[i].id);
    }
    //
  })
  .catch(function(err) {
    Raven.captureException(err);
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
      checkForMembership(usrs[i]);
    }
  });
setInterval(function() {
  // console.log('.');
  if (TICKER > 0) {
    process.exit(); // we need to exit the task if there is no activity(completed)
  }
  TICKER++;
}, 5000);


