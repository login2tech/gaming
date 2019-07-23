const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const bookshelf = require('../config/bookshelf');
const Team = require('../routes/teams/TeamUser');
const UserFollower = require('./UserFollower');
const Score = require('./Score');
const XP = require('./XP');

const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function() {
    this.on('saving', this.hashPassword, this);
  },
  //
  teamuser: function() {
    return this.hasMany(Team);
  },

  followers: function() {
    return this.hasMany('UserFollower', 'user_id');
  },

  followerCount: function() {
    return this.hasMany('UserFollower', 'user_id');
  },
  followingCount: function() {
    return this.hasMany('UserFollower', 'follower_id');
  },
  following: function() {
    return this.hasMany('UserFollower', 'follower_id');
  },
  score : function () {
    return this.hasMany('Score', 'user_id');
  },
  xp_obj : function () {
    return this.hasMany('XP', 'user_id');
  },

  hashPassword: function(model, attrs, options) {
    const password = options.patch ? attrs.password : model.get('password');
    if (!password) {
      return;
    }
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, null, function(err, hash) {
          if (options.patch) {
            attrs.password = hash;
          }
          model.set('password', hash);
          resolve();
        });
      });
    });
  },

  comparePassword: function(password, done) {
    const model = this;
    bcrypt.compare(password, model.get('password'), function(err, isMatch) {
      done(err, isMatch);
    });
  },

  hidden: ['password', 'passwordResetToken', 'passwordResetExpires'],

  virtuals: {
    gravatar: function() {
      if (!this.get('email')) {
        return 'https://gravatar.com/avatar/?s=200&d=retro';
      }
      const md5 = crypto
        .createHash('md5')
        .update(this.get('email'))
        .digest('hex');
      return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
    }
  }
});

module.exports = bookshelf.model('User', User);

// module.exports = ;

// module.exports = User;
