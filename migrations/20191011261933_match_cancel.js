exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('matches', function(table) {
      table.boolean('cancel_requested');
      table.string('cancel_requested_by');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // console.log('red');
};
