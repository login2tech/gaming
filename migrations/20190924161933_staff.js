exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('form_staff', function(table) {
      table.increments();

      table.string('first_name');
      table.string('last_name');
      table.string('email');
      table.string('address');
      table.string('phone_number');
      table.string('date_of_birth');
      table.string('position');
      table.string('about_yourself');
      table.text('why_intested');
      table.text('qualification');
      table.text('why');

      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  // console.log('red');
};
