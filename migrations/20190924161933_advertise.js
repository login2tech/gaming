exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('form_advertise', function(table) {
      table.increments();

      table.string('name');
      table.string('email');
      table.string('tel');
      table.string('instagram');
      table.string('you_are_a');

      table.text('why');

      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  // console.log('red');
};
