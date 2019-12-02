exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      // table.increments();
      // table.integer('team_id').references('teams.id');
      // table.integer('season');
      // table.integer('year');
      table.datetime('double_xp_exp');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('team_xp')]);
};
