const bookshelf = require('../../config/bookshelf');
const Thread = require('../threads/Thread');

const Topic = bookshelf.Model.extend({
  tableName: 'topics',
  hasTimestamps: false,
  threads: function() {
    return this.hasMany(Thread);
  }

  
});

module.exports = bookshelf.model('Topic', Topic);

// module.exports = Topic;
