const bookshelf = require('../../config/bookshelf');
// const TeamUser = require('../teams/TeamUser');
// const Team = require('../teams/Team');
// const Ladder = require('../games/Ladder');
// const Game = require('../games/Game');

const Ticket = require('../tickets/Ticket');
const Money8Match = bookshelf.Model.extend({
  tableName: 'money_8_match',
  hasTimestamps: true,
  // team_users: function() {
  //   return this.hasMany('TeamUser');
  // },
  ladder: function() {
    return this.belongsTo('Ladder');
  },
  tickets: function() {
    return this.hasMany(Ticket, 'extra_1');
  },
  game: function() {
    return this.belongsTo('Game', 'game_id');
  }
});
// module.exports = Team;
module.exports = bookshelf.model('Money8Match', Money8Match);
