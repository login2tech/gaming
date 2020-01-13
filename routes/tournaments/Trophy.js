const bookshelf = require('../../config/bookshelf');

const Tournament = require('./Tournament');

const Trophy = bookshelf.Model.extend({
  tableName: 'trophies',
  hasTimestamps: true,

  user_id: function() {
    return this.belongsTo('User', 'user_id');
  },

  tournament: function() {
    return this.belongsTo('Tournament', 'tournament_id');
  }
});
module.exports = Trophy;
