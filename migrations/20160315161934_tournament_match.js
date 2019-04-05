exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('tournament_matches', function(table) {
      table.increments();
      table.integer('tournament_id').references('tournaments.id');
      table.integer('team_1_id').references('teams.id');
      table.integer('team_2_id').references('teams.id');
      table.integer('winner').references('teams.id');
      table.datetime('starts_at');
      table.string('team_1_result').defaultTo('');
      table.string('team_2_result').defaultTo('');
      table.text('result');
      table.timestamps();
    }),
    knex.schema.table('tournaments', function(table) {
      table.text('team_ids');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('tournaments')]);
};
