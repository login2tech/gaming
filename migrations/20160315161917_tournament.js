exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('tournaments', function(table) {
      table.increments();
      table.string('title');
      table.integer('game_id').references('games.id');
      table.string('tournament_starts_on');
      table.string('price_amount');
      table.integer('max_teams');
      table.integer('member_per_team');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('tournaments')]);
};
