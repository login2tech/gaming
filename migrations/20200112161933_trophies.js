exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('trophies', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.integer('tournament_id').references('tournaments.id');
      table.string('type');
      table.boolean('reset_done');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {};
