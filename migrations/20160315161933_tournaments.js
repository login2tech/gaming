exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('tournaments', function(table) {
      table.increments();
      table.string('title');
      // table.string('status');
      table.integer('game_id').references('games.id');
      table.integer('ladder_id').references('ladders.id');
      table.integer('total_teams');
      table.integer('teams_registered');
      table.string('status').defaultTo('pending');
      table.datetime('starts_at');
      table.datetime('registration_start_at');
      table.datetime('registration_end_at');
      table.integer('entry_fee');
      table.integer('first_winner_price');
      table.integer('second_winner_price');
      table.integer('third_winner_price');

      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('tournaments')]);
};
