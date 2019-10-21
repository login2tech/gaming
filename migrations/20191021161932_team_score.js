exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('team_score', function(table) {
      table.increments();
      table.integer('team_id').references('teams.id');
      table.integer('ladder_id').references('ladders.id');
      table.integer('game_id').references('games.id');
      table.integer('season');
      table.integer('year');
      table.integer('wins');
      table.integer('loss');
    })
  ]);
};

exports.down = function(knex, Promise) {
  //
  //
};
