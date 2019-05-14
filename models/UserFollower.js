// const crypto = require('crypto');
// const bcrypt = require('bcrypt-nodejs');
const bookshelf = require('../config/bookshelf');
// const User = require('./User');
const UserFollower = bookshelf.Model.extend({
  tableName: 'user_follower',
  hasTimestamps: false,

  // initialize: function() {
  //   this.on('saving', this.hashPassword, this);
  // },
  user: function() {
    return this.belongsTo('User', 'user_id');
  },
  follower: function() {
    return this.belongsTo('User', 'follower_id');
  }
});

module.exports = bookshelf.model('UserFollower', UserFollower);

// module.exports = ;

// module.exports = User;
