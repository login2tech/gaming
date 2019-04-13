const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const Comments = bookshelf.Model.extend({
  tableName: 'comments',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo('User');
  }
});

module.exports = bookshelf.model('Comments', Comments);
