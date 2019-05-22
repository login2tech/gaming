exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('post_upvotes', function(table) {
      table.string('type').defaultTo('like');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('posts')]);
};
