const bookshelf = require('../../config/bookshelf');
const Thread = require('../threads/Thread');

const Tickets = bookshelf.Model.extend({
  tableName: 'tickets',
  hasTimestamps: true,
  threads: function() {
    return this.hasMany(Thread);
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
