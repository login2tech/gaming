exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('match_chat', function(table) {
      table.increments();
      table.integer('from_id').references('users.id');
      table.integer('match_id');
      table.string('match_type');
      table.text('message');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('match_chat')]);
};
