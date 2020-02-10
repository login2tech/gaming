exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('games', function(table) {
      table.increments();
      table.string('title');
      table.string('image_url');
      table.string('banner_url');
      table.string('game_logo');
      table.string('game_order');
      table.text('rules');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('games')]);
};
