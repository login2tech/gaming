exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      table.datetime('double_xp_exp');
      table.string('prime_type');
      table.datetime('prime_exp');
      table.integer('double_xp_tokens').defaultTo(0);
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('team_xp')]);
};
