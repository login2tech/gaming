const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const CreditTransaction = bookshelf.Model.extend({
  tableName: 'credit_trasactions',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = CreditTransaction;
