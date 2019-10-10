// const fs = require('fs');
const Item = require('./Team');
const ItemChild = require('./TeamUser');
const User = require('../../models/User');
const ObjName = 'Team';
const Notif = require('../../models/Notification');
const Match = require('../matches/Match');
exports.team_pic = function(req, res, next) {
  if (!req.body.profile_picture && !req.body.cover_picture) {
    return res.status(400).send({ok: false, msg: 'Image missing'});
  }
  const item = new Item({id: req.query.team_id});
  item.fetch().then(function(item) {
    if (!item) {
      return;
    }
    item
      .save(req.body, {patch: true})
      .then(function(usr) {
        res.send({
          // item: user,
          msg: 'Your Team Info has been updated.'
        });
      })
      .catch(function(err) {
        // console.log(err);
        res.status(400).send({
          msg: 'Some error occoured'
        });
      });
  });
};
exports.approve = function(req, res, next) {
  //
  if (!req.body.team_id) {
    res.status(400).send({ok: false, msg: 'Please enter Team ID'});
  }
  if (req.body.mode == 'reject') {
    new ItemChild()
      .where({team_id: req.body.team_id, user_id: req.user.id})
      .destroy()
      .then(function(teamusr) {
        const a = res.status(200).send({
          ok: true,
          msg: 'Rejected the invitation.'
        });
        new Item()
          .where({id: req.body.team_id})
          .fetch()
          .then(function(tm) {
            if (!tm) {
              return;
            }
            const team_creator = tm.get('team_creator');
            new Notif().save({
              description: 'The invitation to join has been rejected',
              user_id: team_creator,
              type: 'team_invite',
              object_id: req.body.team_id
            });
          });
        return a;
      })
      .catch(function(err) {
        console.log(err);
        res.status(400).send({
          ok: false,
          msg: 'failed to reject invite'
        });
      });
    return;
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
          const a = new Item()
            .where({id: req.body.team_id})
            .fetch()
            .then(function(tm) {
              if (!tm) {
                return;
              }
              const team_creator = tm.get('team_creator');
              new Notif().save({
                description: 'The invitation to join team has been accepted',
                user_id: team_creator,
                type: 'team_invite',
                object_id: req.body.team_id
              });
            });
          return a;
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
        msg: 'failed to accept invite'
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

          new ItemChild()
            .where({
              user_id: user_id,
              removed: false
            })
            .fetchAll({
              withRelated: ['team_info']
            })
            .then(function(teams) {
              teams = teams.toJSON();
              for (let i = 0; i < teams.length; i++) {
                if (
                  teams[i].team_info.ladder_id == parseInt(req.body.ladder_id)
                ) {
                  // failed;
                  return res.status(400).send({
                    ok: false,
                    msg:
                      'The user is already a member of another team for this ladder.'
                  });
                }
              }

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
                  new Notif()
                    .save({
                      user_id: user_id,
                      description: 'You have been invited to a team',
                      type: 'team_invite',
                      object_id: team.id
                    })
                    .then(function() {})
                    .catch(function(er) {
                      console.log(er);
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
  const a = new ItemChild().where({
    user_id: req.query.uid,
    removed: false
  });
  if (req.query.filter_active && req.query.filter_active == 'yes') {
    a = a.where({
      removed: false
    });
  }
  a.fetchAll({
    withRelated: [
      'team_info',
      'team_info.team_users',
      'team_info.team_users.user_info'
    ]
  })
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
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  new ItemChild()
    .where({
      user_id: req.user.id,
      removed: false
    })
    .fetchAll({
      withRelated: ['team_info']
    })

    .then(function(teams) {
      teams = teams.toJSON();
      for (let i = 0; i < teams.length; i++) {
        if (teams[i].team_info.ladder_id == parseInt(req.body.ladder)) {
          // failed;
          return res.status(400).send({
            ok: false,
            msg: 'You are already a member of another team for this ladder.'
          });
        }
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

exports.removeMembers = function(req, res, next) {
  const team_id = req.body.team_id;
  const members = req.body.members;
  if (!team_id || !members) {
    return res.status(400).send({ok: false, msg: 'invalid number of params'});
  }
  new ItemChild()
    .where('user_id', 'in', members)
    .save(
      {
        removed: true
      },
      {method: 'update'}
    )
    .then(function(data) {
      res.status(200).send({ok: true, msg: 'Successfully removed users.'});
    });
};
exports.disband = function(req, res, next) {
  const team_id = req.body.team_id;
  if (!team_id) {
    return res.status(400).send({ok: false, msg: 'invalid number of params'});
  }
  new Item()
    .where({
      id: team_id
    })
    .save(
      {
        removed: true
      },
      {method: 'update'}
    )
    .then(function(data) {
      res.status(200).send({ok: true, msg: 'Successfully removed team.'});
      new Match()
        .where({
          team_1: team_id,
          status: 'pending'
        })
        .destroy()
        .then(function() {})
        .catch(function() {
          //
        });
    });
};
