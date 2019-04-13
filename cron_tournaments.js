// Libraries
require('dotenv').config({silent: true});
const moment = require('moment');

// Controllers
// const EmailController = require('./controllers/emails');
// const plan_config = require('./config/plans.js');

// Models
// const User = require('./models/User');
// const UserGroup = require('./models/UserGroup');
// const Group = require('./models/Group');
const Tournament = require('./routes/tournaments/Tournament');

let TICKER = 0;
function reset_ticker() {
  // console.log('reseting..')
  TICKER = 0;
}

new Tournament()
  .where('registration_end_at', '<', moment())
  .where({status: 'pending'})
  .fetchAll({withRelated: []})
  .then(function(tournaments) {
    reset_ticker();
    if (!tournaments) {
      return;
    }
    tournaments = tournaments.toJSON();
    for (let i = 0; i < tournaments.length; i++) {
      // `
      // tournaments`
      //
    }
    //
  });

setInterval(function() {
  // console.log('.');
  if (TICKER > 0) {
    process.exit(); // we need to exit the task if there is no activity(completed)
  }
  TICKER++;
}, 5000);
