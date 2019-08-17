exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('posts', function(table) {
       table.integer('repost_count').defaultTo(0);
       // table.boolean('is_repost').defaultTo(false);
       table.integer('repost_of');
       table.integer('repost_of_user_id');

    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('xp_trasactions')]);
};
