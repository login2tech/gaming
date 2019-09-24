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
    // return Upvotes.collection().query('where', 'post_id', '=', this.get('id')).count('*');
  },
  comments: function() {
    return this.hasMany('Comments', 'post_id');
  },
  original_poster: function() {
    return this.belongsTo(User, 'repost_of_user_id');
  }
});

module.exports = bookshelf.model('Post', Post);
