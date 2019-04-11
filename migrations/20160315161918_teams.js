exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('teams', function(table) {
      table.increments();
      table.string('title');
      table.integer('team_creator').references('users.id');
      table.string('profile_picture');
      table.string('cover_picture');
      table.timestamps();
    }),
    knex.schema.createTable('team_users', function(table) {
      table.increments();
      table.integer('team_id').references('teams.id');
      table.integer('user_id').references('users.id');
      table.boolean('accepted').defaultTo(false);
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('teams'),
    knex.schema.dropTable('team_users')
  ]);
};
