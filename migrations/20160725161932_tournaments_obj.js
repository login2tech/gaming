exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournaments', function(table) {
      // table.increments();
      table.text('teams_obj');
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
