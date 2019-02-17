exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('invoices', function(table) {
      table.increments();

      table.string('charge_id');
      table.integer('user_id').references('users.id');
      table.float('amount');
      table.string('created');
      table.string('currency');
      table.boolean('paid');
      table.string('receipt_url');
      table.string('status');
      table.string('source');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('invoices')]);
};
