exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('comments', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.integer('post_id').references('posts.id');
      table.text('comment');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('comments')]);
};
