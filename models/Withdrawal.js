const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const WithdrawalRequest = bookshelf.Model.extend({
  tableName: 'withdrawal_requests',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = bookshelf.model('WithdrawalRequest', WithdrawalRequest);
