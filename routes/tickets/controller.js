// const fs = require('fs');
const Item = require('./Ticket');
const ObjName = 'Ticket';

exports.listItem = function(req, res, next) {
  //{withRelated: ['thread_count']}
  //todo
  // TODO:
  // new Item()
  //   .orderBy('id', 'DESC')
  Item.orderBy('id', 'DESC')
    .fetchAll()
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listMy = function(req, res, next) {
  Item.where({user_id: req.user.id})
    .fetchAll()
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, items: []});
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
  let a = new Item().where('id', req.params.id);
  if (req.user.role != 'admin') {
    a = a.where('user_id', req.user.id);
  }
  a.fetch({withRelated: ['user']})
    .then(function(item) {
      if (!item) {
        return res.status(400).send({
          id: req.params.id,
          msg:
            "You are not the owner of this ticket or the ticket doesn't exist",
          ok: false
        });
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'Failed to fetch from db'
      });
    });
};

exports.addItem = function(req, res, next) {
  req.assert('ticket_title', 'Title cannot be blank').notEmpty();
  req.assert('ticket_description', 'Content cannot be blank').notEmpty();
  req.assert('ticket_type', 'Issue Type cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item({
    title: req.body.ticket_title,
    description: req.body.ticket_description,
    type: req.body.ticket_type,
    user_id: req.user.id,
    extra_1: req.body.extra_1 ? ('' + req.body.extra_1).replace('#', '') : '',
    extra_2: req.body.extra_2,
    extra_3: req.body.extra_3,
    attachment: req.body.ticket_attachment ? req.body.ticket_attachment : ''
  })
    .save()
    .then(function(item) {
      res.send({ok: true, msg: 'New Ticket has been created successfully.'});
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
    platform: req.body.platform,
    image_url: req.body.image_url
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

exports.closeItem = function(req, res, next) {
  new Item()
    .where({id: req.body.ticket_id})
    .save(
      {
        status: 'closed'
      },
      {method: 'update'}
    )
    .then(function(post) {
      res
        .status(200)
        .send({ok: true, msg: 'The ticket has been successfully closed.'});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while closing the ' + ObjName});
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
