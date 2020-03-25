const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');

// const Groups = bookshelf.Model.extend({
//   tableName: 'category',
//   hasTimestamps: false
// });

const MatchChat = bookshelf.Model.extend({
  tableName: 'match_chat',
  hasTimestamps: true,
  from: function() {
    return this.belongsTo(User, 'from_id');
  }
});

module.exports = MatchChat;
