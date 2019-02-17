exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('language', function(table) {
      table.increments();
      table.string('key');
      table.text('l_1');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('language')]);
};
