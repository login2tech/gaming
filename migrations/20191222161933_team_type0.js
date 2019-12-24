exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('teams', function(table) {
      table.integer('team_t_id');
    })
  ]);
};

exports.down = function(knex, Promise) {};
