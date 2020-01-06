exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('membership_logs', function(table) {
      table.increments();
      table.integer('user_id').references('users.id');
      table.string('descr');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {};
