exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('teams', function(table) {
      table.integer('ladder_id').references('ladders.id');
      // table.integer('follower_id').references('users.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('user_follower')]);
};
