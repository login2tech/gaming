const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const Upvotes = bookshelf.Model.extend({
  tableName: 'post_upvotes',
  hasTimestamps: false,
  user: function() {
    return this.belongsTo('User');
  }
});

module.exports = bookshelf.model('Upvotes', Upvotes);
