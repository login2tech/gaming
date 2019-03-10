exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('threads', function(table) {
      table.increments();
      table.string('title');
      table.integer('user_id').references('users.id');
      table.integer('topic_id').references('topics.id');
      table.text('description');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('threads')]);
};
