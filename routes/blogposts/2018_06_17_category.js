exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('category', function(table) {
      table.increments();
      table.string('title');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('category')]);
};
