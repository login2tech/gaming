const bookshelf = require('../../config/bookshelf');

const Category = bookshelf.Model.extend({
  tableName: 'category',
  hasTimestamps: false
});

module.exports = Category;
