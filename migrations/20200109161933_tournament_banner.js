exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournaments', function(table) {
      table.string('banner_url');
    })
  ]);
};

exports.down = function(knex, Promise) {};
