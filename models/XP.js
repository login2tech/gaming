const bookshelf = require('../config/bookshelf');
const User = require('../models/User');

const XP = bookshelf.Model.extend({
  tableName: 'xp',
  hasTimestamps: false,
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = bookshelf.model('XP', XP);
