exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournament_matches', function(table) {
      table.string('team_1_players');
      table.string('team_2_players');
      table.string('status');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('xp_trasactions')]);
};
