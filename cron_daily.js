// Libraries
require('dotenv').config({silent: true});
const moment = require('moment');

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

setInterval(function() {
  console.log('.');
  if (TICKER > 0) {
    process.exit(); // we need to exit the task if there is no activity(completed)
  }
  TICKER++;
}, 5000);
