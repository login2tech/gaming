const bookshelf = require('../../config/bookshelf');
const User = require('../../models/User');
const Upvotes = require('./PostUpvotes');
const Comments = require('./PostComments');
const Post = bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  },

  upvotes: function() {
    return this.hasMany('Upvotes', 'post_id');
  },
  like_count: function() {
    return this.hasMany('Upvotes', 'post_id');
  },
  comments: function() {
    return this.hasMany('Comments', 'post_id');
  }
});

module.exports = bookshelf.model('Post', Post);
