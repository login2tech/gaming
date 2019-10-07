exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tickets', function(table) {
      table.string('extra_1');
      table.string('extra_2');
      table.string('extra_3');
    })
  ]);
};

exports.down = function(knex, Promise) {
  //
};
