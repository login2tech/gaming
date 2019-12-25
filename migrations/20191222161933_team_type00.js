exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('ladders', function(table) {
      table.integer('platform');
    })
  ]);
};

exports.down = function(knex, Promise) {};
