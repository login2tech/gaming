const bookshelf = require('../config/bookshelf');

const FormStaffApplication = bookshelf.Model.extend({
  tableName: 'form_staff',
  hasTimestamps: false
});

module.exports = FormStaffApplication;
