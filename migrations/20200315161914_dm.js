exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('messages', function(table) {
      table.increments();
      table.integer('from_id').references('users.id');
      table.integer('to_id').references('users.id');
      table.text('message');
      table.boolean('read').defaultTo(false);
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('messages')]);
};
