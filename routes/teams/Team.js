const bookshelf = require('../../config/bookshelf');
const TeamUser = require('./TeamUser');
const Ladder = require('../games/Ladder');
const Game = require('../games/Game');

const Team = bookshelf.Model.extend({
  tableName: 'teams',
  hasTimestamps: true,
  team_users: function() {
    return this.hasMany('TeamUser');
  },
  ladder: function() {
    return this.belongsTo('Ladder');
  }

  // thread_count: function() {
  //   return new Topic.Model()
  //     .query(function(qb) {
  //       qb.where('topic_id', 9);
  //       qb.count();
  //     })
  //     .fetch();
  // }
});
// module.exports = Team;
module.exports = bookshelf.model('Team', Team);
