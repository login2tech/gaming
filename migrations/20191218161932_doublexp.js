exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      // table.increments();
      // table.integer('team_id').references('teams.id');
      // table.integer('season');
      // table.integer('year');
      table.integer('double_xp_tokens').defaultTo(0);
      // table.datetime('prime_exp');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('team_xp')]);
};
