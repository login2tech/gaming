exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('faqs', function(table) {
      table.increments();
      table.string('title');
      table.text('content');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('faqs')]);
};
