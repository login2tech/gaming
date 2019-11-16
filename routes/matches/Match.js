const bookshelf = require('../../config/bookshelf');
const TeamUser = require('../teams/TeamUser');
const Team = require('../teams/Team');
const Ladder = require('../games/Ladder');
const Game = require('../games/Game');
const Ticket = require('../tickets/Ticket');

const Match = bookshelf.Model.extend({
  tableName: 'matches',
  hasTimestamps: true,
  // team_users: function() {
  //   return this.hasMany('TeamUser');
  // },
  ladder: function() {
    return this.belongsTo('Ladder');
  },
  game: function() {
    return this.belongsTo('Game', 'game_id');
  },
  tickets: function() {
    return this.hasMany(Ticket, 'extra_1');
  },
  team_1_info: function() {
    return this.belongsTo('Team', 'team_1_id');
  },
  team_2_info: function() {
    return this.belongsTo('Team', 'team_2_id');
  }
});
// module.exports = Team;
module.exports = bookshelf.model('Match', Match);
