const bookshelf = require('../../config/bookshelf');
const Ladder = require('./Ladder');
const Game = bookshelf.Model.extend({
  tableName: 'games',
  hasTimestamps: false,
  ladders: function() {
    return this.hasMany('Ladder');
  }
});

module.exports = Game;
