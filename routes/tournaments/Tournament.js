const bookshelf = require('../../config/bookshelf');
const Game = require('../games/Game');

const Tournament = bookshelf.Model.extend({
  tableName: 'tournaments',
  hasTimestamps: true,
  game: function() {
    return this.belongsTo(Game);
  }
});
module.exports = Tournament;
