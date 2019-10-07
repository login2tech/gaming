exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tickets', function(table) {
      table.string('attachment');
      table.integer('replies').defaultTo(0);
    }),
    knex.schema.table('ticket_replies', function(table) {
      table.string('attachment');
      table.boolean('from_admin');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('xp_trasactions')]);
};
