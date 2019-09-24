const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');

const TeamUser2 = bookshelf.Model.extend({
  tableName: 'team_users',
  hasTimestamps: true,
  user_info: function() {
    return this.belongsTo('User');
  },
  team_info: function() {
    return this.belongsTo('Team2');
  }
});

exports.TeamUser2 = bookshelf.model('TeamUser2', TeamUser2);
const Ladder = require('../games/Ladder');
const Game = require('../games/Game');

const Team2 = bookshelf.Model.extend({
  tableName: 'teams',
  hasTimestamps: true,
  team_users: function() {
    return this.hasMany('TeamUser2');
  },
  ladder: function() {
    return this.belongsTo('Ladder');
  }
});

exports.Team2 = bookshelf.model('Team2', Team2);
