const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');

// const Groups = bookshelf.Model.extend({
//   tableName: 'category',
//   hasTimestamps: false
// });

const DM = bookshelf.Model.extend({
  tableName: 'messages',
  hasTimestamps: true,
  from: function() {
    return this.belongsTo(User);
  },
  to: function() {
    return this.belongsTo(User);
  }
});

module.exports = DM;
