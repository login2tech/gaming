const bookshelf = require('../../config/bookshelf');
const Category = require('./Category');

const BlogPost = bookshelf.Model.extend({
  tableName: 'blogpost',
  hasTimestamps: true,
  category: function() {
    return this.belongsTo(Category);
  }
});

module.exports = BlogPost;
