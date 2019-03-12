// const fs = require('fs');
const Item = require('./Team');
const ItemChild = require('./TeamUser');
const User = require('../../models/User');
const ObjName = 'Team';

exports.invite = function(req, res, next) {
  //
  if (!req.body.username || !req.body.team_id) {
    res.status(400).send({ok: false, msg: 'Please enter username'});
  }
  new Item({id: req.body.team_id})
    .fetch({withRelated: ['team_users', 'team_users.user_info']})
    .then(function(team) {
      team = team.toJSON();

      let team_user;
      for (let i = 0; i < team.team_users.length; i++) {
        team_user = team.team_users[i].user_info;
        if (team_user.username == req.body.username) {
          res.status(400).send({
            ok: false,
            msg: 'User already a part of team or already invited.'
          });
          return;
        }
      }
      new User()
        .where({
          username: req.body.username
        })
        .fetch()
        .then(function(user) {
          if (!user) {
            res.status(400).send({
              ok: false,
              msg: 'Username does not exist.'
            });
            return;
          }
          const user_id = user.id;
          new ItemChild({
            team_id: team.id,
            user_id: user_id,
            accepted: false
          })
            .save()
            .then(function() {
              res.status(200).send({
                ok: true,
                msg: 'User invited successfully.'
              });
            })
            .catch(function(err) {
              console.log(err);
              res.status(400).send({
                ok: false,
                msg: 'failed to invite user'
              });
            });
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'failed to invite user'
          });
        });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'failed to invite user'
      });
    });
};
exports.team_of_user = function(req, res, next) {
  new ItemChild()
    .where({
      user_id: req.query.uid
    })
    .fetchAll({withRelated: ['team_info']})
    .then(function(team_info) {
      res.send({
        teams: team_info.toJSON(),
        ok: true
      });
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, teams: []});
    });
};

exports.listItem = function(req, res, next) {
  new Item()
    // .where('id', req.params.id)
    .fetchAll({withRelated: ['team_users', 'team_users.user_info', 'ladder']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
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
  new Item()
    .where('id', req.params.id)
    .fetch({withRelated: ['team_users', 'team_users.user_info', 'ladder']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({id: req.params.id});
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
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item({
    title: req.body.title,
    ladder_id: req.body.ladder,
    team_creator: req.user.id
  })
    .save()
    .then(function(item) {
      res.send({
        ok: true,
        msg: 'New Item has been created successfully.',
        team: item.toJSON()
      });
      new ItemChild({
        team_id: item.id,
        user_id: req.user.id,
        accepted: true
      }).save();
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
