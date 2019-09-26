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
const Match = require('./routes/matches/Match');

let TICKER = 0;
function reset_ticker() {
  // console.log('reseting..')
  TICKER = 0;
}
const delete_match = function(ta) {
  new Match()
    .where({id: ta})
    .destroy()
    .then(function(d) {
      //
    })
    .catch(function(err) {
      //
    });
};
new Match()
  .where('starts_at', '<', moment())
  .where('status', 'LIKE', 'pending')
  // .where({status: 'pending'})
  .fetchAll({withRelated: []})
  .then(function(matches) {
    reset_ticker();
    if (!matches) {
      return;
    }
    matches = matches.toJSON();
    // console.log(tournaments);
    for (let i = 0; i < matches.length; i++) {
      // `
      // tournaments`
      //
      delete_match(matches[i].id);
    }
    //
  });

setInterval(function() {
  console.log('.');
  if (TICKER > 0) {
    process.exit(); // we need to exit the task if there is no activity(completed)
  }
  TICKER++;
}, 5000);
