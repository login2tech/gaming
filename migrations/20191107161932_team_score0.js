exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('team_xp', function(table) {
      table.increments();
      table.integer('team_id').references('teams.id');
      table.integer('season');
      table.integer('year');
      table.integer('xp');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('team_xp')]);
};
