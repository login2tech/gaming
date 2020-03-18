exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('gen_rules', function(table) {
      table.increments();
      table.string('title');
      table.text('content');
      // table.text('category');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('gen_rules')]);
};
