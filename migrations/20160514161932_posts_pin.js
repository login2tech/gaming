exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('posts', function(table) {
      table.boolean('is_pinned').defaultTo(false);
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('posts')]);
};
