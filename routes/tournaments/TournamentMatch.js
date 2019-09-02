const bookshelf = require('../../config/bookshelf');
// const tournament_matches = require('../games/Game');
// const Ladder = require('../games/Ladder');
const Team = require('../teams/Team');
const TournamentMatch = bookshelf.Model.extend({
  tableName: 'tournament_matches',
  hasTimestamps: true,

  team_1_info: function() {
    return this.belongsTo('Team', 'team_1_id');
  },
  team_2_info: function() {
    return this.belongsTo('Team', 'team_2_id');
  }
  // game: function() {
  //   return this.belongsTo(Game);
  // },
  // ladder: function() {
  //   return this.belongsTo(Ladder);
  // }
});
module.exports = TournamentMatch;
