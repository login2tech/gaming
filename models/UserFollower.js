// const crypto = require('crypto');
// const bcrypt = require('bcrypt-nodejs');
const bookshelf = require('../config/bookshelf');
// const Team = require('../routes/teams/TeamUser');
const UserFollower = bookshelf.Model.extend({
  tableName: 'user_follower',
  hasTimestamps: false

  // initialize: function() {
  //   this.on('saving', this.hashPassword, this);
  // },
  // teamuser: function() {
  //   return this.hasMany(Team);
  // },
});

module.exports = bookshelf.model('UserFollower', UserFollower);

// module.exports = ;

// module.exports = User;
