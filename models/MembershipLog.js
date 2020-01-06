const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const MembershipLog = bookshelf.Model.extend({
  tableName: 'membership_logs',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = MembershipLog;
