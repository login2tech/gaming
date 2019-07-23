const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const XPTransactions = bookshelf.Model.extend({
  tableName: 'xp_trasactions',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = XPTransactions;
