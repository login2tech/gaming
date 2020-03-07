// const fs = require('fs');
const Item = require('./Team');
const ItemChild = require('./TeamUser');
const User = require('../../models/User');
const ObjName = 'Team';
const Notif = require('../../models/Notification');
const Match = require('../matches/Match');
const matches = require('../matches/controller');
exports.changeName = function(req, res, next) {
  if (!req.body.new_team_name || !req.body.team_id) {
    return res.status(400).send({ok: false, msg: 'Details missing'});
  }
  const item = new Item({id: req.body.team_id});
  item.fetch().then(function(item) {
    if (!item) {
      return;
    }
    item
      .save({title: req.body.new_team_name}, {method: 'update'})
      .then(function(usr) {
        res.send({
          // item: user,
          msg: 'Your Team name has been updated.'
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

exports.listMyInvites = function(req, res, next) {
  new ItemChild()
    .where({accepted: false, user_id: req.user.id})
    .fetchAll({
      withRelated: [
        'team_info',
        {
          'team_info.ladder': function(qb) {
            return ['id', 'title'];
          }
        },
        {
          'team_info.ladder.game_info': function(qb) {
            return ['id', 'title'];
          }
        }
      ]
    })
    .then(function(invites) {
      if (!invites) {
        res.status(200).send({
          ok: true,
          items: []
        });
        return;
      }
      invites = invites.toJSON();
      // invites = invites.map(function(item) {
      //   return item.team_info;
      // });
      res.status(200).send({
        ok: true,
        items: invites
      });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to fetch team invites',
        items: []
      });
    });
  return;
};

exports.approve = function(req, res, next) {
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
        .where('username', 'ILIKE', req.body.username)
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
                  teams[i].team_info.ladder_id ==
                    parseInt(req.body.ladder_id) &&
                  teams[i].team_info.team_type == req.body.team_type
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
  let a = new ItemChild().where({
    user_id: req.query.uid,
    removed: false
  });
  if (req.query.filter_actives && req.query.filter_actives == 'yes') {
    a = a.where({
      removed: false
    });
  }

  // if (req.query.filter_tournament_id) {
  //   a = a.where({
  //     // team_t_id: req.query.filter_tournament_id
  //   });
  // }

  if (req.query.filter_active && req.query.filter_active == 'yes') {
    a = a.where({
      removed: false
    });
  }
  a.fetchAll({
    withRelated: [
      'team_info',
      'team_info.ladder',
      'team_info.ladder.game_info',
      'team_info.team_users',
      'team_info.team_users.user_info',
      'team_info.score'
    ]
  })
    .then(function(team_info) {
      team_info = team_info.toJSON();

      if (req.query.filter_type) {
        team_info = team_info.filter(function(item) {
          if (item.team_info.team_type == req.query.filter_type) {
            return true;
          } else {
            return false;
          }
        });
      }

      if (req.query.filter_tournament_id) {
        req.query.filter_tournament_id = parseInt(
          req.query.filter_tournament_id
        );
        team_info = team_info.filter(function(item) {
          if (item.team_info.team_t_id == req.query.filter_tournament_id) {
            return true;
          } else {
            return false;
          }
        });
      }

      if (req.query.filter_ladder) {
        team_info = team_info.filter(function(item) {
          if (item.team_info.ladder_id == req.query.filter_ladder) {
            return true;
          } else {
            return false;
          }
        });
      }

      res.send({
        teams: team_info,
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
    .fetch({
      withRelated: [
        'team_users',
        'team_users.user_info',
        'ladder',
        'score',
        'xp_obj'
      ]
    })
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

  req.assert('title', 'Team name must be atleast 3 characters long').len(3);

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
        if (
          teams[i].team_info.ladder_id == parseInt(req.body.ladder) &&
          teams[i].team_info.team_type == req.body.team_type &&
          teams[i].team_info.removed == false
        ) {
          // console.log(here);
          // console
          if (
            req.body.team_type == 'tournaments' &&
            teams[i].team_info.team_t_id != req.body.team_t_id
          ) {
            //
          } else {
            // failed;
            return res.status(400).send({
              ok: false,
              msg: 'You are already a member of another team for this ladder.'
            });
          }
        }
      }
      new Item({
        title: req.body.title,
        ladder_id: req.body.ladder,
        team_creator: req.user.id,
        team_type: req.body.team_type,
        team_t_id: req.body.team_t_id
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
      console.log('step init');
      new Match()
        .where({
          team_1_id: team_id,
          result: 'disputed'
        })
        .fetchAll()
        .then(function(disputed_matches) {
          disputed_matches = disputed_matches.toJSON();
          console.log(disputed_matches);
          for (let i = 0; i < disputed_matches.length; i++) {
            matches.resolveDispute(
              null,
              null,
              null,
              disputed_matches[i].id,
              'team_2'
            );
          }
        })
        .catch(function(err) {
          console.log('#574', err);
        });
      new Match()
        .where({
          team_2_id: team_id,
          result: 'disputed'
        })
        .fetchAll()
        .then(function(disputed_matches) {
          disputed_matches = disputed_matches.toJSON();
          console.log('set 2', disputed_matches);
          for (let i = 0; i < disputed_matches.length; i++) {
            matches.resolveDispute(
              null,
              null,
              null,
              disputed_matches[i].id,
              'team_1'
            );
          }
        })
        .catch(function(err) {
          console.log('#596', err);
        });
      new Match()
        .where({
          team_1_id: team_id,
          status: 'pending'
        })
        .save(
          {
            status: 'cancelled'
          },
          {method: 'update'}
        )
        .then(function() {})
        .catch(function(err) {
          console.log(err);
        });

      new Match()
        .where({
          team_1_id: team_id,
          status: 'accepted'
        })
        .fetchAll()
        .then(function(disputed_matches) {
          disputed_matches = disputed_matches.toJSON();
          console.log('set 3', disputed_matches);
          for (let i = 0; i < disputed_matches.length; i++) {
            matches.giveWin(null, null, null, disputed_matches[i].id, 'team_2');
          }
        })
        .catch(function(err) {
          console.log('#596', err);
        });

      new Match()
        .where({
          team_2_id: team_id,
          status: 'accepted'
        })
        .fetchAll()
        .then(function(disputed_matches) {
          disputed_matches = disputed_matches.toJSON();
          console.log('set 4', disputed_matches);
          for (let i = 0; i < disputed_matches.length; i++) {
            matches.giveWin(null, null, null, disputed_matches[i].id, 'team_1');
          }
        })
        .catch(function(err) {
          console.log('#596', err);
        });
    });
};
