const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');

const ThreadReply = bookshelf.Model.extend({
  tableName: 'thread_replies',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});
module.exports = ThreadReply;
