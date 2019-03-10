const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const ThreadReplies = require('../ThreadReplies/ThreadReply');
const Tournament = bookshelf.Model.extend({
  tableName: 'threads',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  },
  thread_replies: function() {
    return this.hasMany(ThreadReplies);
  }
});
module.exports = Tournament;
