exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('tickets', function(table) {
      table.increments();
      table.text('title');
      table.text('description');
      table.string('type');
      table.string('status').defaultTo('submitted');
      table.integer('user_id').references('users.id');
      table.integer('thread_id').references('threads.id');
      // table.text('description');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('tickets')]);
};
