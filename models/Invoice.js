const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const Invoice = bookshelf.Model.extend({
  tableName: 'invoices',
  hasTimestamps: false,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = Invoice;
