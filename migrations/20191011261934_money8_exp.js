exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('money_8_match', function(table) {
      table.dateTime('expires_in');
    })
  ]);
};

exports.down = function(knex, Promise) {
  //
};
