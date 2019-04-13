exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('user_follower', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.integer('follower_id').references('users.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('user_follower')]);
};
