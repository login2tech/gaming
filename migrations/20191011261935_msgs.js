exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('chats', function(table) {
      table.increments();
      table.integer('from_id').references('users.id');
      table.integer('game_id').references('games.id');
      table.text('msg');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('chats')]);
};
