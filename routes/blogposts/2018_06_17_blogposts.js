exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('blogpost', function(table) {
      table.increments();
      table.string('title');
      table.text('content');
      table.integer('category_id');
      table.string('slug');
      table.string('image_url');
      table.text('short_content');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('blogpost')]);
};
