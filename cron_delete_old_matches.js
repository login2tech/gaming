const Raven = require('raven');
Raven.config('https://a6c40c1f84954d8f92472d82355a10fe@sentry.io/1876355');

// Libraries
require('dotenv').config({silent: true});
const moment = require('moment');
const utils = require('./routes/utils');

// Controllers
// const EmailController = require('./controllers/emails');
// const plan_config = require('./config/plans.js');

// Models
// const User = require('./models/User');
// const UserGroup = require('./models/UserGroup');
// const Group = require('./models/Group');
const Match = require('./routes/matches/Match');
const Money8 = require('./routes/money8/Money8Match');
const User = require('./models/User');
const Tournament = require('./routes/tournaments/Tournament');
const TournamentMatch = require('./routes/tournaments/TournamentMatch');
const matchesController = require('./routes/matches/controller');
const money8Controller = require('./routes/money8/controller');
const tournamentController = require('./routes/tournaments/controller');
const Notif = require('./models/Notification');

let TICKER = 0;
function reset_ticker() {
  // console.log('reseting..')
  TICKER = 0;
}
const delete_tournament = function(tid, tour) {
  const tour_price = tour.entry_fee;

  if (tour.teams_registered > 0 && tour_price > 0) {
    let team_ids = tour.team_ids;
    team_ids = team_ids.split(',');
    team_ids = team_ids.filter(function(item) {
      if (item == '') {
        return false;
      }
      return true;
    });
    // team_ids = team_ids.map(function(item) {
    //   return parseInt(item);
    // });
    const players = JSON.parse(tour.teams_obj);
    // console.log(team_ids);
    for (let i = 0; i < team_ids.length; i++) {
      const team_id = team_ids[i];
      const players_of_team = players['team_' + team_id];
      // console.log(players_of_team);
      for (let j = 0; j < players_of_team.length; j++) {
        utils.giveCreditsToUser(
          players_of_team[j],
          tour_price,
          'Refund for cancelled tournament #' + tour.id,
          't_' + tour.id
        );
        new Notif().save({
          description: 'The tournament you joined is now cancelled.',
          user_id: players_of_team[j],
          type: 'tournament',
          object_id: tour.id
        });
        // console.log('vo');

        //tour_price
        // refund tour price to players_of_team[i];
        //tour_price
      }
    }
  }
  new Tournament()
    .where({id: tid})
    .save(
      {
        status: 'cancelled'
      },
      {
        method: 'update'
      }
    )
    .then(function(d) {
      // console.log('ye');
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
    });
};
const delete_match = function(ta, match) {
  let team_1 = match.team_1_players;
  let team_2 = match.team_2_players;
  if (team_1) {
    team_1 = team_1.split('|');
  } else {
    team_1 = [];
  }
  if (team_2) {
    team_2 = team_2.split('|');
  } else {
    team_2 = [];
  }
  if (match.match_type == 'cash' || match.match_type == 'credits') {
    for (let i = 0; i < team_1.length; i++) {
      if (match.match_type == 'cash') {
        utils.giveCashToUser(
          team_1[i],
          match.match_fee,
          'Refund for cancelled matchfinder match #' + match.id,
          'm_' + match.id
        );
      } else if (match.match_type == 'credits') {
        utils.giveCreditsToUser(
          team_1[i],
          match.match_fee,
          'Refund for cancelled matchfinder match #' + match.id,
          'm_' + match.id
        );
      }
    }
    for (let i = 0; i < team_2.length; i++) {
      if (match.match_type == 'cash') {
        utils.giveCashToUser(
          team_2[i],
          match.match_fee,
          'Refund for cancelled matchfinder match #' + match.id,
          'm_' + match.id
        );
      } else if (match.match_type == 'credits') {
        utils.giveCreditsToUser(
          team_2[i],
          match.match_fee,
          'Refund for cancelled matchfinder match #' + match.id,
          'm_' + match.id
        );
      }
    }
  }

  new Match()
    .where({id: ta})
    .destroy()
    .then(function(d) {
      //
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
    });
};
const delete_money8 = function(ta, match) {
  const match_players = JSON.parse(match.players);
  if (match.match_type == 'cash' || match.match_type == 'credits') {
    for (let i = 0; i < match_players.length; i++) {
      if (match.match_type == 'cash') {
        utils.giveCashToUser(
          match_players[i],
          match.match_fee,
          'Refund for cancelled mix & match #' + match.id,
          'm8_' + match.id
        );
      } else if (match.match_type == 'credits') {
        utils.giveCreditsToUser(
          match_players[i],
          match.match_fee,
          'Refund for cancelled mix & match #' + match.id,
          'm8_' + match.id
        );
      }
    }
  }

  new Money8()
    .where({id: ta})
    .destroy()
    .then(function(d) {
      //
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
    });
};
const updateUserRank = function(uid, rank) {
  User.forge({id: uid})
    .save(
      {
        xp_rank: rank
      },
      {
        path: true,
        method: 'update'
      }
    )
    .then(function(d) {
      //
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
    });
};
const unresponsive_match = function(m_id, match) {
  if (match.team_1_result || match.team_2_result) {
    // console.log('// 1 ne diya score.. usko jitao');
    if (match.team_1_result) {
      // console.log('here');
      matchesController.resolveDispute(null, null, null, m_id, 'team_1', true);
    } else if (match.team_2_result) {
      matchesController.resolveDispute(null, null, null, m_id, 'team_2', true);
    }
  } else {
    new Match()
      .where({id: m_id})
      .save(
        {
          status: 'disputed',
          result: 'disputed'
        },
        {method: 'update'}
      )
      .then(function() {
        //
      })
      .catch(function(err) {console.log(err)
        // console.log(err);
        Raven.captureException(err);
      });
  }
};
const unresponsive_match_money8 = function(m_id, match) {
  if (match.team_1_result || match.team_2_result) {
    // console.log('// 1 ne diya score.. usko jitao');
    if (match.team_1_result) {
      // console.log('here');
      money8Controller.resolveDispute(null, null, null, m_id, 'team_1', true);
    } else if (match.team_2_result) {
      money8Controller.resolveDispute(null, null, null, m_id, 'team_2', true);
    }
  } else {
    // console.log('here');
    new Money8()
      .where({id: m_id})
      .save(
        {
          status: 'disputed',
          result: 'disputed'
        },
        {method: 'update'}
      )
      .then(function() {
        //
      })
      .catch(function(err) {console.log(err)
        // console.log(err);
        Raven.captureException(err);
      });
  }
};
const unresponsive_tour_match = function(m_id, match) {
  console.log(match);
  if (match.team_1_result || match.team_2_result) {
    // console.log('// 1 ne diya score.. usko jitao');
    if (match.team_1_result) {
      // console.log('here');
      tournamentController.resolveDispute(
        null,
        null,
        null,
        m_id,
        'team_1',
        true
      );
    } else if (match.team_2_result) {
      tournamentController.resolveDispute(
        null,
        null,
        null,
        m_id,
        'team_2',
        true
      );
    }
  } else {
    // console.log('here');
    new TournamentMatch()
      .where({id: m_id})
      .save(
        {
          status: 'disputed',
          result: 'disputed'
        },
        {method: 'update'}
      )
      .then(function() {
        //
      })
      .catch(function(err) {console.log(err)
        // console.log(err);
        Raven.captureException(err);
      });
  }
};
const process_8 = function() {
  reset_ticker();
  new TournamentMatch()
    .where('status', 'LIKE', 'started')
    .where('starts_at', '<', moment().subtract(3, 'hours'))
    .fetchAll()
    .then(function(matches) {
      if (!matches) {
        return;
      }
      matches = matches.toJSON();
      // console.log(matches);
      for (let i = 0; i < matches.length; i++) {
        unresponsive_tour_match(matches[i].id, matches[i]);
      }
      reset_ticker();
      // setTimeout(process_8, 4000);
      //
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
      // return res.status(400).send({ok: false, items: []});
      reset_ticker();
      // setTimeout(process_7, 4000);
    });
};
const process_7 = function() {
  reset_ticker();
  new Money8()
    .where('status', 'LIKE', 'started')
    .where('expires_in', '<', moment().subtract(3, 'hours'))
    .fetchAll()
    .then(function(matches) {
      if (!matches) {
        return;
      }
      matches = matches.toJSON();
      // console.log(matches);
      for (let i = 0; i < matches.length; i++) {
        unresponsive_match_money8(matches[i].id, matches[i]);
      }
      reset_ticker();
      setTimeout(process_8, 4000);
      //
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
      // return res.status(400).send({ok: false, items: []});
      reset_ticker();
      setTimeout(process_8, 4000);
    });
};
const process_6 = function() {
  reset_ticker();
  new Match()
    .where('status', 'LIKE', 'accepted')
    .where('starts_at', '<', moment().subtract(3, 'hours'))
    .fetchAll()
    .then(function(matches) {
      if (!matches) {
        return;
      }
      matches = matches.toJSON();
      // console.log(matches);
      for (let i = 0; i < matches.length; i++) {
        unresponsive_match(matches[i].id, matches[i]);
      }
      reset_ticker();
      setTimeout(process_7, 4000);
      //
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
      // return res.status(400).send({ok: false, items: []});
      reset_ticker();
      setTimeout(process_7, 4000);
    });
};
const process_5 = function() {
  reset_ticker();
  // console.log('settling ranks');
  new User()
    .orderBy('life_xp', 'DESC')
    .orderBy('life_earning', 'DESC')
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(usrs) {
      usrs = usrs.toJSON();
      const le = usrs.length;
      for (let i = 0; i < le; i++) {
        if (usrs[i].xp_rank == i + 1) {
          continue;
        }
        // console.log(usrs[i].xp_rank, i + 1);
        updateUserRank(usrs[i].id, i + 1);
      }
      reset_ticker();
      setTimeout(process_6, 6000);
      // return res.status(200).send({ok: true, items: usrs.toJSON()});
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
      // return res.status(400).send({ok: false, items: []});
      reset_ticker();
      setTimeout(process_6, 6000);
    });
};
const process_4 = function() {
  reset_ticker();
  // console.log('clearing old tournaments');

  new Tournament()
    .where('registration_end_at', '<', moment())
    .where({
      status: 'pending'
    })
    .fetchAll()
    .then(function(tournaments) {
      tournaments = tournaments.toJSON();
      for (let i = 0; i < tournaments.length; i++) {
        delete_tournament(tournaments[i].id, tournaments[i]);
      }
      reset_ticker();
      setTimeout(process_5, 6000);
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
      reset_ticker();
      setTimeout(process_5, 6000);
    });
  // reset_ticker();
  // setTimeout(process_5, 6000);
};
const process_3 = function() {
  reset_ticker();
  // console.log('clearing cancelled matches');
  new Match()
    .where('status', 'cancelled')
    .fetchAll({withRelated: []})
    .then(function(matches) {
      reset_ticker();
      if (!matches) {
        return;
      }
      matches = matches.toJSON();
      // console.log(matches.length);
      for (let i = 0; i < matches.length; i++) {
        delete_match(matches[i].id, matches[i]);
      }
      reset_ticker();
      setTimeout(process_4, 6000);
    })
    .catch(function(err) {
      console.log(err)
      Raven.captureException(err);
      reset_ticker();
      setTimeout(process_4, 6000);
    });
};
const process_2 = function() {
  reset_ticker();
  // console.log('clearing pending money8');
  new Money8()
    .where('expires_in', '<', moment())
    .where('status', 'LIKE', 'pending')
    .fetchAll({withRelated: []})
    .then(function(matches) {
      reset_ticker();
      if (!matches) {
        return;
      }
      matches = matches.toJSON();
      // console.log(matches.length);
      for (let i = 0; i < matches.length; i++) {
        delete_money8(matches[i].id, matches[i]);
      }
      setTimeout(process_3, 6000);
      reset_ticker();
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
      reset_ticker();
      setTimeout(process_3, 6000);
    });
};
const process_1 = function() {
  reset_ticker();
  // console.log('clearing pending matches');
  new Match()
    .where('starts_at', '<', moment())
    .where('status', 'LIKE', 'pending')
    .fetchAll({withRelated: []})
    .then(function(matches) {
      reset_ticker();
      if (!matches) {
        return;
      }
      matches = matches.toJSON();
      for (let i = 0; i < matches.length; i++) {
        delete_match(matches[i].id, matches[i]);
      }
      reset_ticker();
      setTimeout(process_2, 6000);
    })
    .catch(function(err) {console.log(err)
      Raven.captureException(err);
      reset_ticker();
      setTimeout(process_2, 6000);
    });
};

process_1();

//

// new Tournament().

setInterval(function() {
  // console.log('.');
  if (TICKER > 0) {
    process.exit(); // we need to exit the task if there is no activity(completed)
  }
  TICKER++;
}, 10000);
