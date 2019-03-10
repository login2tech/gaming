exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      // table.increments();
      table.integer('credit_balance').defaultTo(0);
      table.integer('cash_balance').defaultTo(0);
      table.string('stripe_user_id');
      table.boolean('prime');
      table.text('prime_obj').defaultTo({});
      table.boolean('double_xp');
      table.text('double_xp_obj').defaultTo({});
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    // knex.schema.dropTable('teams'),
    // knex.schema.dropTable('team_users')
  ]);
};
