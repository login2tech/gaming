exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('post_upvotes', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.integer('post_id').references('posts.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('post_upvotes')]);
};
