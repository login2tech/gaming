exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('xp', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.integer('season');
      table.integer('year');
      table.integer('xp');
    })
  ]);
};

exports.down = function(knex, Promise) {
	return Promise.all([knex.schema.dropTable('xp')]);
};
