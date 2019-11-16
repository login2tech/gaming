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
const Money8 = require('./routes/money8/Money8Match');
const User = require('./models/User');

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
      console.log(err);
    });
};
const delete_money8 = function(ta) {
  new Money8()
    .where({id: ta})
    .destroy()
    .then(function(d) {
      //
    })
    .catch(function(err) {
      console.log(err);
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
    .catch(function(err) {
      console.log(err);
    });
};

//
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
    // console.log(matches.length);
    for (let i = 0; i < matches.length; i++) {
      // `
      // tournaments`
      //
      delete_match(matches[i].id);
    }
    //
  })
  .catch(function(err) {
    console.log(err);
  });

//
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
      delete_money8(matches[i].id);
    }
  })
  .catch(function(err) {
    console.log(err);
  });

//
new Match()
  .where('status', 'cancelled')
  .destroy()
  .then(function() {
    reset_ticker();
    console.log('deleted');
  })
  .catch(function(err) {
    console.log(err);
  });

//
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
      console.log(usrs[i].xp_rank, i + 1);
      updateUserRank(usrs[i].id, i + 1);
    }
    // return res.status(200).send({ok: true, items: usrs.toJSON()});
  })
  .catch(function(err) {
    console.log(err);
    // return res.status(400).send({ok: false, items: []});
  });

//
setInterval(function() {
  console.log('.');
  if (TICKER > 0) {
    process.exit(); // we need to exit the task if there is no activity(completed)
  }
  TICKER++;
}, 5000);
