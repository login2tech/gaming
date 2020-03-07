exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      table.string('ip');
      table.string('state');
      table.string('country');
    }),
    knex.schema.table('tickets', function(table) {
      table.string('url_1');
      table.string('url_2');
      table.string('url_3');
    })
  ]);
};

exports.down = function(knex, Promise) {
  //
};
