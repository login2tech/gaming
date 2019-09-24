const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const Game = require('../games/Game');

const Ladder = bookshelf.Model.extend({
  tableName: 'ladders',
  hasTimestamps: false,
  user_info: function() {
    return this.belongsTo(User);
  },
  game_info: function() {
    return this.belongsTo('Game', 'game_id');
  }
});

module.exports = bookshelf.model('Ladder', Ladder);

// module.exports = ;
