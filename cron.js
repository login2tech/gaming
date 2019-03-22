const Match = require('./routes/matches/match');
const moment = require('moment');

new Match()
  .where({
    status: 'pending'
  })
  .where('starts_at', '<', moment())
  .fetchAll()
  .then(function(matches) {
    matches = matches.toJSON();
    console.log(matches);
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (!match.team_1_id || !match.team_2_id) {
        doMatchExpire(match.id);
        // }
        // if (!match.team_1_id || !match.team_1_id) {
        // doMatchExpire(match.id);
      } else {
        console.log('no need');
      }
    }
  })
  .catch(function(er) {
    console.log(er);
  });

function doMatchExpire(id) {
  console.log('chanding');
  new Match()
    .where({id: id})
    .fetch()
    .then(function(match) {
      match.save({
        status: 'expired'
      });
    });
}
