exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('tournament_matches', function(table) {
       table.text('brackets');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('xp_trasactions')]);
};
