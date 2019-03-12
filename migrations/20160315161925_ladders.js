exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('ladders', function(table) {
      table.increments();
      table.string('title');
      table.integer('game_id').references('games.id');
      table.integer('max_players');
      table.text('rules');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('ladders')]);
};
