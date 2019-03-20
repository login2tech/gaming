// const fs = require('fs');
const Game = require('./Game');

exports.listGame = function(req, res, next) {
  new Game()
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['ladders']})
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
    image_url: req.body.image_url
    // category_id: req.body.category_id,
    // short_content: req.body.short_content
  })
    .save()
    .then(function(game) {
      res.send({ok: true, msg: 'New Game has been created successfully.'});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Game'});
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
    image_url: req.body.image_url
  };

  if (req.body.remove_media) {
    obj.image_url = '';
  }
  game
    .save(obj)
    .then(function(blg) {
      blg
        .fetch()
        .then(function(bll) {
          res.send({
            game: bll.toJSON(),
            msg: 'Game has been updated.'
          });
        })
        .catch(function(err) {
          console.log(err);
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the Game'});
        });
    })
    .catch(function(err) {
      console.log(err);

      res
        .status(400)
        .send({msg: 'Something went wrong while updating the Game'});
    });
};

exports.deleteGame = function(req, res, next) {
  new Game({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The Game Item has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the Game'});
    });
};
