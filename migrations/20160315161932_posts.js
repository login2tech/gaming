exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('posts', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.text('post');
      table.boolean('is_repost');
      // table.integer('comment_count');
      table.string('image_url');
      table.string('video_url');
      // table.text('post');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('posts')]);
};
