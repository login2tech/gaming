const bookshelf = require('../config/bookshelf');

const FormAdvertise = bookshelf.Model.extend({
  tableName: 'form_advertise',
  hasTimestamps: false
});

module.exports = FormAdvertise;
