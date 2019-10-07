exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('withdrawal_requests', function(table) {
      table.increments();
      table.string('user_id');
      table.string('method');
      table.string('path');
      table.string('amount');
      table.string('status');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  // console.log('red');
};
