const bookshelf = require('../config/bookshelf');

const GenRules = bookshelf.Model.extend({
  tableName: 'gen_rules',
  hasTimestamps: false
});

module.exports = GenRules;
