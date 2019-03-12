exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('games', function(table) {
      table.increments();
      table.string('title');
      // table.string('platform');
      table.string('image_url');
      table.string('game_logo');
      table.text('rules');
      // table.text('ladders');
    })
    // knex.schema.createTable('ladders', function(table) {
    //   table.increments();
    //   table.integer('game_id').references('users.id');
    //   table.string('title');
    //   table.text('rules');
    // })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('games')]);
};
