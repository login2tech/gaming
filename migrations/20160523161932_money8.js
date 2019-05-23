exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('money_8_match', function(table) {
      table.increments();
      table.integer('game_id').references('games.id');
      table.integer('ladder_id').references('ladders.id');

      table.string('status').defaultTo('pending');
      table.integer('players_total');
      table.integer('players_joined').defaultTo(1);
      // table.integer('players_joined');
      table.string('players');
      table.string('code');

      table.string('match_type');
      table.string('match_fee');

      table.string('team_1');
      table.string('team_2');
      table.text('result');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  // return Promise.all([knex.schema.dropTable('posts')]);
};
