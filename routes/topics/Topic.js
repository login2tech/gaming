const bookshelf = require('../../config/bookshelf');
const Thread = require('../threads/Thread');

const Tournament = bookshelf.Model.extend({
  tableName: 'topics',
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
module.exports = Tournament;
