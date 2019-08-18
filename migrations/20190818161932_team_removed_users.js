exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('team_users', function(table) {
       table.boolean('removed').defaultTo(false);
    }),
    knex.schema.table('teams', function(table) {
       table.boolean('removed').defaultTo(false);
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('xp_trasactions')]);
};
