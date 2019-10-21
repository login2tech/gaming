exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('score', function(table) {
      // table.increments();
      table.integer('game_id').references('games.id');
      // table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('chats')]);
};
