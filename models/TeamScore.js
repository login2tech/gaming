const bookshelf = require('../config/bookshelf');
const User = require('../models/User');
const Ladder = require('../routes/games/Ladder');

const TeamScore = bookshelf.Model.extend({
  tableName: 'team_score',
  hasTimestamps: false,
  user: function() {
    return this.belongsTo(User);
  },
  ladder: function() {
    return this.belongsTo('Ladder');
  }
});

module.exports = bookshelf.model('TeamScore', TeamScore);
