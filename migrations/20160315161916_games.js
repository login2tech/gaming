exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('games', function(table) {
      table.increments();
      table.string('title');
      table.string('platform');
      // table.text('platforms');
      table.string('image_url');
      table.text('ladders');
      // table.timestamps();
    }),
    knex.schema.createTable('ladders', function(table) {
      table.increments();
      table.integer('game_id').references('users.id');
      table.string('title');
      table.text('rules');
      // table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('notifs')]);
};
