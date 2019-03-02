const bookshelf = require('../../config/bookshelf');
const Game = bookshelf.Model.extend({
  tableName: 'games',
  hasTimestamps: false
});

module.exports = Game;
