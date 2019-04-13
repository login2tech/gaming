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
const TournamentMatch = require('./routes/tournaments/TournamentMatch');

let TICKER = 0;
function reset_ticker() {
  // console.log('reseting..')
  TICKER = 0;
}
const chunkMe = function(ar, chunkSize) {
  const temporal = [];

  for (let i = 0; i < ar.length; i += chunkSize) {
    temporal.push(ar.slice(i, i + chunkSize));
  }

  return temporal;
};

const createMatches = function(t, sets) {
  if (!sets.length) {
    return;
  }
  for (let i = 0; i < sets.length; i++) {
    //
    const team_1 = sets[i][0];
    const team_2 = sets[i][1];
    new TournamentMatch().save({
      tournament_id: t.id,
      team_1_id: team_1,
      team_2_id: team_2 ? team_2 : null,
      winner: team_2 ? null : team_1,
      starts_at: t.starts_at,
      result: team_2 ? '' : 'Team Promoted - No Opponent'
    });
  }
};
const changeStatus_and_decide_teams = function(ta) {
  new Tournament()
    .where({id: ta.id})
    .fetch()
    .then(function(t) {
      let sets_of_2 = [];
      const obj = {status: 'registration_closed'};
      if (t.teams_registered < 2) {
        obj.status = 'cancelled';
      } else {
        let teams = ta.team_ids.split(',');
        teams = teams.filter(function(el) {
          return el != '';
        });
        teams = teams.map(function(x) {
          return parseInt(x);
        });
        sets_of_2 = chunkMe(teams, 2);
        console.log(sets_of_2);
      }
      t.save(obj);
      createMatches(ta, sets_of_2);
    });
};
new Tournament()
  .where('registration_end_at', '<', moment())
  // .where({status: 'pending'})
  .fetchAll({withRelated: []})
  .then(function(tournaments) {
    reset_ticker();
    if (!tournaments) {
      return;
    }
    tournaments = tournaments.toJSON();
    // console.log(tournaments);
    for (let i = 0; i < tournaments.length; i++) {
      // `
      // tournaments`
      //
      changeStatus_and_decide_teams(tournaments[i]);
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
