exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('xp_trasactions', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.string('details');
      table.double('qty');
      table.timestamps();

    })
  ]);
};

exports.down = function(knex, Promise) {
	return Promise.all([knex.schema.dropTable('xp_trasactions')]);
};
