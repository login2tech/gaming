exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      table.integer('pndng_uname_changes').defaultTo(0);
    })
  ]);
};

exports.down = function(knex, Promise) {};
