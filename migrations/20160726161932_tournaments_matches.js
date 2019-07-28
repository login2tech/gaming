exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournament_matches', function(table) {
      // table.increments();
      // table.text('teams_obj');
       table.string('team_1_players');
      table.string('team_2_players');
      table.string('status');
      // table.double('life_earning').defaultTo(0);
      // table.integer('wins').defaultTo(0);
      // table.integer('loss').defaultTo(0)/;
      // table.double('qty');
      // table.timestamps();

    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('xp_trasactions')]);
};
