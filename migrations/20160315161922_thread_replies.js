exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('thread_replies', function(table) {
      table.increments();
      table.text('content');
      table.integer('user_id').references('users.id');
      table.integer('thread_id').references('threads.id');
      // table.text('description');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('thread_replies')]);
};
