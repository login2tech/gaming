const bookshelf = require('../../config/bookshelf');
// const tournament_matches = require('../games/Game');
// const Ladder = require('../games/Ladder');

const TournamentMatch = bookshelf.Model.extend({
  tableName: 'tournament_matches',
  hasTimestamps: true
  // game: function() {
  //   return this.belongsTo(Game);
  // },
  // ladder: function() {
  //   return this.belongsTo(Ladder);
  // }
});
module.exports = TournamentMatch;
