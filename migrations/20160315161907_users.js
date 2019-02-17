exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.increments();
      table.string('first_name');
      table.string('last_name');
      table.string('username').unique();
      table.string('email').unique();
      table.string('password');
      // table.string('facebook');
      table.string('gender');
      table.string('dob');
      table.string('picture');
      table.string('passwordResetToken');
      table.dateTime('passwordResetExpires');
      table.string('role').defaultTo('user');
      table.boolean('status').defaultTo(true);
      table.boolean('email_verified').defaultTo(false);
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('users')]);
};
