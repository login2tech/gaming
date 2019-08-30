const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const ThreadReplies = require('../ThreadReplies/ThreadReply');
const Topic = require('../topics/Topic');
const Thread = bookshelf.Model.extend({
  tableName: 'threads',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  },
  thread_replies: function() {
    return this.hasMany(ThreadReplies);
  },
  topic: function() {
    return this.belongsTo('Topic');
  }
});
module.exports = Thread;
