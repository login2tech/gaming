const bookshelf = require('../../config/bookshelf');
const TeamUser = require('./TeamUser');
const Ladder = require('../games/Ladder');
const Game = require('../games/Game');
const TeamScore = require('../../models/TeamScore');
const TeamXP = require('../../models/TeamXP');

const Team = bookshelf.Model.extend({
  tableName: 'teams',
  hasTimestamps: true,
  team_users: function() {
    return this.hasMany('TeamUser');
  },
  ladder: function() {
    return this.belongsTo('Ladder');
  },
  score: function() {
    return this.hasMany('TeamScore');
  },
  xp_obj: function() {
    return this.hasMany('TeamXP', 'team_id');
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
