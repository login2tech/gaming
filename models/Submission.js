const bookshelf = require('../config/bookshelf');
const User = require('../models/User');
const Vote = require('../models/Vote');

const Submission = bookshelf.Model.extend({
  tableName: 'submissions',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  },
  votes: function() {
    return this.hasMany(Vote);
  }
});

module.exports = Submission;
