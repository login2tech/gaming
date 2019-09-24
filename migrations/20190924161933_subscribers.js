exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('form_subscribers', function(table) {
      table.increments();

      table.string('email').unique();

      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  // console.log('red');
};
