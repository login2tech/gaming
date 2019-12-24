exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournament_matches', function(table) {
      table.integer('game_settings').defaultTo(0);
    }),
    knex.schema.table('matches', function(table) {
      table.integer('game_settings').defaultTo(0);
    }),
    knex.schema.table('money_8_match', function(table) {
      table.integer('game_settings').defaultTo(0);
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('team_xp')]);
};
