exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      table.string('ban_reason').defaultTo('');
      table.dateTime('ban_date');
    })
  ]);
};

exports.down = function(knex, Promise) {};
