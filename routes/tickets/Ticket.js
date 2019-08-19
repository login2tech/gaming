const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const Thread = require('../threads/Thread');

const Tickets = bookshelf.Model.extend({
  tableName: 'tickets',
  hasTimestamps: true,
  threads: function() {
    return this.hasMany(Thread);
  },
   user: function() {
    return this.belongsTo(User);
  }


  // thread_count: function() {
  //   return new Topic.Model()
  //     .query(function(qb) {
  //       qb.where('topic_id', 9);
  //       qb.count();
  //     })
  //     .fetch();
  // }
});
module.exports = Tickets;
