exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('matches', function(table) {
      table.integer('match_players');
      table.string('team_1_players');
      table.string('team_2_players');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('posts')]);
};
