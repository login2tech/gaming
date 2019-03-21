exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function(table) {
      table.string('gamer_tag_1');
      table.string('gamer_tag_2');
      table.string('gamer_tag_3');
      table.string('gamer_tag_4');
      table.string('gamer_tag_5');
      table.string('gamer_tag_6');
      table.string('profile_picture');
      table.string('cover_picture');
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('matches')]);
};
