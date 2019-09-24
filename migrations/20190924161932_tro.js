exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournaments', function(table) {
      table.boolean('member_tournament').defaultTo(false);
    })
  ]);
};

exports.down = function(knex, Promise) {
  console.log('red');
};
