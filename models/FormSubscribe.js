const bookshelf = require('../config/bookshelf');

const FormSubscribe = bookshelf.Model.extend({
  tableName: 'form_subscribers',
  hasTimestamps: false
});

module.exports = FormSubscribe;
