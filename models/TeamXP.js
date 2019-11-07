const bookshelf = require('../config/bookshelf');
const Team = require('../routes/teams/Team');

const TeamXP = bookshelf.Model.extend({
  tableName: 'team_xp',
  hasTimestamps: false,
  team: function() {
    return this.belongsTo(Team);
  }
});

module.exports = bookshelf.model('TeamXP', TeamXP);
