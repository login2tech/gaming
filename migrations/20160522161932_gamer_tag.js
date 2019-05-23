exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('ladders', function(table) {
      table.string('gamer_tag');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('posts')]);
};
