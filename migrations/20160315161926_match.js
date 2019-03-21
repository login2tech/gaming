exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('matches', function(table) {
      table.increments();
      table.integer('game_id').references('games.id');
      table.integer('ladder_id').references('ladders.id');
      table.integer('team_1_id').references('teams.id');
      table.integer('team_2_id').references('teams.id');
      table.string('status').defaultTo('pending');
      table.datetime('starts_at');

      table.string('match_type');
      table.string('match_fee');

      table.datetime('started_at');
      table.text('result');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('matches')]);
};
