exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('score', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.integer('ladder_id').references('ladders.id');
      table.integer('season');
      table.integer('year');
      table.integer('wins');
      table.integer('loss');
    })
  ]);
};

exports.down = function(knex, Promise) {
//
};
