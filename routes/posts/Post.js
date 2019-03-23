const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const Post = bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = bookshelf.model('Post', Post);
