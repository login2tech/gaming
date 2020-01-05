exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('ladders', function(table) {
      table.string('platform');
    })
  ]);
};

exports.down = function(knex, Promise) {};
