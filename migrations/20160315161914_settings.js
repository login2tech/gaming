exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('settings', function(table) {
      table.increments();
      table.string('key').unique();
      table.string('type');
      table.text('content');
      table.string('page');
      table.string('label');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('language')]);
};
