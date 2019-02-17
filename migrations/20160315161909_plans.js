exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('plans', function(table) {
      table.increments();
      table.string('plan_name');
      table.integer('jury_count');
      table.integer('cost');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('plans')]);
};
