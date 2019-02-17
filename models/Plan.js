const bookshelf = require('../config/bookshelf');
const Plans = bookshelf.Model.extend({
  tableName: 'plans',
  hasTimestamps: false
});

module.exports = Plans;
