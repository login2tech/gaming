exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournament_matches', function(table) {
      table.text('game_settings');
    }),
    knex.schema.table('matches', function(table) {
      table.text('game_settings');
    }),
    knex.schema.table('money_8_match', function(table) {
      table.text('game_settings');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('team_xp')]);
};
