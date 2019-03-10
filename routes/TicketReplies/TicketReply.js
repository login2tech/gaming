const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');

const TicketReply = bookshelf.Model.extend({
  tableName: 'ticket_replies',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});
module.exports = TicketReply;
