// const fs = require('fs');
const Game = require('../games/Ladder');

exports.listGame = function(req, res, next) {
  new Game()
    .orderBy('id', 'DESC')
    .where({
      game_id: req.params.game_id
    })
    .fetchAll()
    .then(function(games) {
      if (!games) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, items: games.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send([]);
    });
};

exports.listPaged = function(req, res, next) {
  let c = new Game();
  c = c.orderBy('id', 'DESC');
  // if (req.query.category_id) {
  //   c = c.where('category_id', 'LIKE', req.query.category_id);
  // }
  let p;
  if (req.query.paged && parseInt(req.query.paged) > 1) {
    p = parseInt(req.query.paged);
  } else {
    p = 1;
  }
  c.fetchPage({page: p, pageSize: 10})
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }
      return res
        .status(200)
        .send({ok: true, items: items.toJSON(), pagination: items.pagination});
    })
    .catch(function(err) {
      // console.log(err)
      return res.status(200).send([]);
    });
};

exports.listSingleGame = function(req, res, next) {
  new Game()
    .where('id', req.params.id)
    .fetch()
    .then(function(game) {
      if (!game) {
        return res
          .status(200)
          .send({id: req.params.id, title: '', content: ''});
      }
      return res.status(200).send({ok: true, item: game.toJSON()});
    })
    .catch(function(err) {
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'Failed to fetch from db'
      });
    });
};

exports.addGame = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Game({
    title: req.body.title,
    max_players: req.body.max_players,
    gamer_tag: req.body.gamer_tag,
    min_players: req.body.min_players,
    game_id: parseInt(req.body.game_id),
    rules: req.body.rules
  })
    .save()
    .then(function(game) {
      res.send({ok: true, msg: 'New Ladder has been created successfully.'});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Ladder'});
    });
};

exports.updateGame = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  // req.assert('category_id', 'Category cannot be blank').notEmpty();

  // console.log(req.body);
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const game = new Game({id: req.body.id});
  const obj = {
    title: req.body.title,
    max_players: req.body.max_players,
    game_id: parseInt(req.body.game_id),
    min_players: req.body.min_players,
    gamer_tag: req.body.gamer_tag,
    rules: req.body.rules
  };

  game
    .save(obj, {
      method: 'update'
    })
    .then(function(blg) {
      blg
        .fetch()
        .then(function(bll) {
          res.send({
            ok: true,
            game: bll.toJSON(),
            msg: 'Ladder has been updated.'
          });
        })
        .catch(function(err) {
          console.log(err);
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the Ladder'});
        });
    })
    .catch(function(err) {
      console.log(err);

      res
        .status(400)
        .send({msg: 'Something went wrong while updating the Ladder'});
    });
};

exports.deleteGame = function(req, res, next) {
  new Game({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The Ladder Item has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the Ladder'});
    });
};
