exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('teams', function(table) {
      table.integer('life_xp').defaultTo(0);
      table.integer('season_xp').defaultTo(0);
    }),
    knex.schema.table('users', function(table) {
      table.integer('life_xp').defaultTo(0);
      table.integer('season_xp').defaultTo(0);
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('user_follower')]);
};
