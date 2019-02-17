const bookshelf = require('../config/bookshelf');

const Lang = bookshelf.Model.extend({
  tableName: 'language',
  hasTimestamps: false
});

module.exports = Lang;
