exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('cms_pages', function(table) {
      table.increments();
      table.string('title');
      table.text('content');
      table.string('slug');
      table.string('is_in_link').defaultTo('no');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('cms_pages')]);
};
