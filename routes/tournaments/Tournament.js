const bookshelf = require('../../config/bookshelf');
const Game = require('../games/Game');
const Ladder = require('../games/Ladder');
const TournamentMatch = require('./TournamentMatch');

const Tournament = bookshelf.Model.extend({
  tableName: 'tournaments',
  hasTimestamps: true,
  game: function() {
    return this.belongsTo(Game);
  },
  ladder: function() {
    return this.belongsTo(Ladder);
  },
  matches: function() {
    return this.hasMany(TournamentMatch);
  }
});
module.exports = Tournament;
