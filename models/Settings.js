const bookshelf = require('../config/bookshelf');

const Settings = bookshelf.Model.extend({
  tableName: 'settings',
  hasTimestamps: true
});

module.exports = Settings;
