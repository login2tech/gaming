const bookshelf = require('../config/bookshelf');

const CMSPage = bookshelf.Model.extend({
  tableName: 'cms_pages',
  hasTimestamps: true
  // category: function() {
  //   return this.belongsTo(Category);
  // }
});

module.exports = CMSPage;
