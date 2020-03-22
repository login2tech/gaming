const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');

// const Groups = bookshelf.Model.extend({
//   tableName: 'category',
//   hasTimestamps: false
// });

const Groups = bookshelf.Model.extend({
  tableName: 'message_groups',
  hasTimestamps: true,
  user_1: function() {
    return this.belongsTo(User, 'user_1_id');
  },
  user_2: function() {
    return this.belongsTo(User, 'user_2_id');
  }
});

module.exports = Groups;
