const bookshelf = require('../config/bookshelf');
// const User = require('../models/User');
// const Ladder = require('../routes/games/Ladder');

const TeamScore = bookshelf.Model.extend({
  tableName: 'team_score',
  hasTimestamps: false
  // team: function() {
  //   return this.belongsTo(Team);
  // },
  // ladder: function() {
  //   return this.belongsTo('Ladder');
  // }
});

module.exports = bookshelf.model('TeamScore', TeamScore);
