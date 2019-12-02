exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('teams', function(table) {
      table.string('team_type');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('team_xp')]);
};
