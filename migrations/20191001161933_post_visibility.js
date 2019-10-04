exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('posts', function(table) {
      table.boolean('is_private').defaultTo(false);
      table.integer('in_timeline_of');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // console.log('red');
};
