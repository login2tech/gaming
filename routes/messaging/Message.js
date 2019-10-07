const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');

const Chat = bookshelf.Model.extend({
  tableName: 'chats',
  hasTimestamps: true,
  from: function() {
    return this.belongsTo(User, 'from_id');
  }
});

module.exports = Chat;
