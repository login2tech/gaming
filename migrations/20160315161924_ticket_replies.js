exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('ticket_replies', function(table) {
      table.increments();
      table.text('content');
      table.integer('user_id').references('users.id');
      table.integer('ticket_id').references('tickets.id');
      // table.text('description');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('ticket_replies')]);
};
