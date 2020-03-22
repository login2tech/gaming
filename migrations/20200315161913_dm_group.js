exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('message_groups', function(table) {
      table.increments();
      table.integer('user_1_id').references('users.id');
      table.integer('user_2_id').references('users.id');
      table.timestamps();
      table.unique(['user_1_id', 'user_2_id']);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('message_groups')]);
};
