// const fs = require('fs');
const moment = require('moment');

const Item = require('./Match');
// const ItemChild = require('./TeamUser');
const User = require('../../models/User');
const ObjName = 'Match';

exports.listupcoming = function(req, res, next) {
  new Item()
    .orderBy('created_at', 'DESC')
    .where('starts_at', '>', moment())
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info']})
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

exports.approve = function(req, res, next) {
  //
  if (!req.body.team_id) {
    res.status(400).send({ok: false, msg: 'Please enter Team ID'});
  }
  new ItemChild({team_id: req.body.team_id, user_id: req.user.id})
    .fetch()
    .then(function(teamusr) {
      if (!teamusr) {
        res.status(400).send({
          ok: false,
          msg: 'You were never invited'
        });
        return;
      }
      teamusr
        .save({
          accepted: true
        })
        .then(function() {
          res.status(200).send({
            ok: true,
            msg: 'Accepted successfully.'
          });
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'failed to accept invite'
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
  req.assert('team_1_id', 'Team cannot be blank').notEmpty();
  req.assert('starts_at', 'Starts At cannot be blank').notEmpty();
  req.assert('match_type', 'Match Type cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item(req.body)
    .save()
    .then(function(item) {
      res.send({
        ok: true,
        msg: 'New Item has been created successfully.',
        match: item.toJSON()
      });
      if (req.body.match_type == 'paid') {
        // block amount
      }
      // new ItemChild({
      //   team_id: item.id,
      //   user_id: req.user.id,
      //   accepted: true
      // }).save();
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};
