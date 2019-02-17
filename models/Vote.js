const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const Votes = bookshelf.Model.extend({
  tableName: 'votes',
  hasTimestamps: false,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = Votes;
