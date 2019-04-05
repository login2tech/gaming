const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
// const Team = require('./Team');

const TeamUser = bookshelf.Model.extend({
  tableName: 'team_users',
  hasTimestamps: true,
  user_info: function() {
    return this.belongsTo('User');
  },
  team_info: function() {
    return this.belongsTo('Team');
  }
});

module.exports = bookshelf.model('TeamUser', TeamUser);

// module.exports = ;
