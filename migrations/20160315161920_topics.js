exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('topics', function(table) {
      table.increments();
      table.string('title');
      table.string('sub_title');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('topics')]);
};
