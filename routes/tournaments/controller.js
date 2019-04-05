// const fs = require('fs');
const Item = require('./Tournament');
const ObjName = 'Tournament';
const moment = require('moment');

exports.listItem = function(req, res, next) {
  new Item()
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['game']})
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send([]);
    });
};

exports.listPaged = function(req, res, next) {
  let c = new Item();
  c = c.orderBy('id', 'DESC');

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

exports.listSingleItem = function(req, res, next) {
  new Item()
    .where('id', req.params.id)
    .fetch()
    .then(function(item) {
      if (!item) {
        return res
          .status(200)
          .send({id: req.params.id, title: '', content: ''});
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
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

exports.listupcoming = function(req, res, next) {
  new Item()
    .orderBy('created_at', 'DESC')
    .where('starts_at', '>', moment())
    // .where('registration_end_at', '>', moment())
    .fetchAll({withRelated: ['ladder', 'game']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.addItem = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item({
    title: req.body.title,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: req.body.starts_at,
    registration_start_at: req.body.registration_start_at,
    registration_end_at: req.body.registration_end_at,
    total_teams: req.body.total_teams,
    entry_fee: req.body.entry_fee,
    first_winner_price: req.body.first_winner_price,
    second_winner_price: req.body.second_winner_price,
    teams_registered: 0,
    third_winner_price: req.body.third_winner_price
  })
    .save()
    .then(function(item) {
      res.send({ok: true, msg: 'New Item has been created successfully.'});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.updateItem = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  // req.assert('category_id', 'Category cannot be blank').notEmpty();

  // console.log(req.body);
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const item = new Item({id: req.body.id});
  const obj = {
    title: req.body.title,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: req.body.starts_at,
    registration_start_at: req.body.registration_start_at,
    registration_end_at: req.body.registration_end_at,
    total_teams: req.body.total_teams,
    entry_fee: req.body.entry_fee,
    first_winner_price: req.body.first_winner_price,
    second_winner_price: req.body.second_winner_price,
    third_winner_price: req.body.third_winner_price
  };

  if (req.body.remove_media) {
    obj.image_url = '';
  }
  item
    .save(obj)
    .then(function(blg) {
      blg
        .fetch()
        .then(function(bll) {
          res.send({
            item: bll.toJSON(),
            msg: ObjName + ' has been updated.'
          });
        })
        .catch(function(err) {
          // console.log(err);
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the ' + ObjName});
        });
    })
    .catch(function(err) {
      // console.log(err);

      res
        .status(400)
        .send({msg: 'Something went wrong while updating the ' + ObjName});
    });
};

exports.deleteItem = function(req, res, next) {
  new Item({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The ' + ObjName + ' has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the ' + ObjName});
    });
};
