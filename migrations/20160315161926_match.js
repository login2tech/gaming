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
      table.string('team_1_result').defaultTo('');
      table.string('team_2_result').defaultTo('');
      table.datetime('started_at');
      table.text('result');
      table.boolean('is_challenge').defaultTo(false);
      table.integer('challenge_for').references('teams.id');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('matches')]);
};
