const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const CashTransactions = bookshelf.Model.extend({
  tableName: 'cash_trasactions',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = CashTransactions;
