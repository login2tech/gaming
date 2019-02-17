const bookshelf = require('../config/bookshelf');

const Notification = bookshelf.Model.extend({
  tableName: 'notifs',
  hasTimestamps: true
});

module.exports = Notification;
