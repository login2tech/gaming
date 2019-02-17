exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('notifs', function(table) {
      table.increments();
      table.string('description');
      table.integer('user_id');
      table.string('type');
      table.integer('object_id');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('notifs')]);
};
