exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('cash_trasactions', function(table) {
      table.string('obj_type').defaultTo('');
    }),
    knex.schema.table('credit_trasactions', function(table) {
      table.string('obj_type').defaultTo('');
    }),
    knex.schema.table('xp_trasactions', function(table) {
      table.string('obj_type').defaultTo('');
    })
  ]);
};

exports.down = function(knex, Promise) {
  console.log('red');
};
