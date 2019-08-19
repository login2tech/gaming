exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('money_8_match', function(table) {
       
      table.string('team_1_result').defaultTo('');
      table.string('team_2_result').defaultTo('');
    }),
  ]);
};

exports.down = function(knex, Promise) {
//
};
