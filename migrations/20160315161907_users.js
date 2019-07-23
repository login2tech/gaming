exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.increments();
      table.string('first_name');
      table.string('last_name');
      table.string('username').unique();
      table.string('email').unique();
      table.string('password');
      table.string('timezone');
      table.string('gender');
      table.string('dob');
      table.string('picture');
      table.string('gamer_tag_1');
      table.string('gamer_tag_2');
      table.string('gamer_tag_3');
      table.string('gamer_tag_4');
      table.string('gamer_tag_5');
      table.string('gamer_tag_6');
      table.string('profile_picture');
      table.string('cover_picture');
      table.double('credit_balance').defaultTo(0);
      table.double('cash_balance').defaultTo(0);
      table.string('stripe_user_id');
      table.boolean('prime');
      table.text('prime_obj').defaultTo('{}');
      table.boolean('double_xp');
      table.text('double_xp_obj').defaultTo('{}');
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
