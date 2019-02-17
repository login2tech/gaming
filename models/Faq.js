const bookshelf = require('../config/bookshelf');

const Faq = bookshelf.Model.extend({
  tableName: 'faqs',
  hasTimestamps: false
});

module.exports = Faq;
