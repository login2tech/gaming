const bookshelf = require('../config/bookshelf');
const User = require('../models/User');
const Ladder = require('../routes/games/Ladder');

const Score = bookshelf.Model.extend({
  tableName: 'score',
  hasTimestamps: false,
  user: function() {
    return this.belongsTo(User);
  },
   ladder: function() {
    return this.belongsTo('Ladder');
  }
});


module.exports = bookshelf.model('Score', Score);
 