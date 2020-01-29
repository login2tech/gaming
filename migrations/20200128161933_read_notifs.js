exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('notifs', function(table) {
      table.boolean('read').defaultTo(false);
    })
  ]);
};

exports.down = function(knex, Promise) {
  //
};
