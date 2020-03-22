const Groups = require('./Groups');
const Message = require('./DM');
const mailer = require('../../controllers/mailer');
// const Notification = require('../../models/Notification');

const User = require('../../models/User');

exports.groupHasUnread = function(req, res, next) {
  new Groups()
    .where({
      id: req.query.grp_id
    })
    .fetch()
    .then(function(grp) {
      if (!grp) {
        return res.status(200).send({ok: true, count: 0});
      }
      const u_1 = grp.get('user_1_id');
      const u_2 = grp.get('user_2_id');
      let from = false;
      let to = false;
      if (req.user.id == u_1) {
        from = u_2;
        to = u_1;
      } else {
        from = u_1;
        to = u_2;
      }

      new Message()
        .where({
          from_id: from,
          to_id: to,
          read: false
        })
        .count()
        .then(function(cnt) {
          // console.log(cnt);
          return res.status(200).send({ok: true, count: cnt});
        })
        .catch(function(err) {
          console.log(err);
          return res.status(200).send({ok: true, count: 0});
        });
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, count: 0});
    });
};
//
exports.allMsgs = function(req, res, next) {
  // const usr = req.user.id;
  new Message()
    .query({
      where: {from_id: req.query.u1, to_id: req.query.u2},
      orWhere: {
        from_id: req.query.u2,
        to_id: req.query.u1
      }
    })
    .fetchAll()
    .then(function(grps) {
      res.status(200).send({
        ok: true,
        items: grps.toJSON()
      });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        items: []
      });
    });
};

exports.allGroups = function(req, res, next) {
  new Groups()

    .orderBy('id', 'desc')
    .fetchAll({
      withRelated: ['user_1', 'user_2']
    })
    .then(function(grps) {
      res.status(200).send({
        ok: true,
        items: grps.toJSON()
      });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        items: []
      });
    });
};

exports.listGroups = function(req, res, next) {
  const usr = req.user.id;
  new Groups()
    .query({where: {user_1_id: usr}, orWhere: {user_2_id: usr}})
    .orderBy('updated_at', 'desc')
    .fetchAll({
      withRelated: ['user_1', 'user_2']
    })
    .then(function(grps) {
      res.status(200).send({
        ok: true,
        items: grps.toJSON()
      });
      if (req.query.clear_too && req.query.clear_too == 'yes') {
        // new Notification()
        //   .where({
        //     user_id: req.user.id,
        //     type: 'm_new'
        //   })
        //   .destroy()
        //   .then(function() {})
        //   .catch(function(err) {});
      }
      // new Messages().
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        items: []
      });
    });
};

exports.chatFor = function(req, res, next) {
  const usr = req.user.id;
  new Message()
    .query({
      where: {from_id: req.query.other_id, to_id: usr},
      orWhere: {
        from_id: usr,
        to_id: req.query.other_id
      }
    })
    .orderBy('id', 'ASC')
    .fetchAll({
      // withRelated: ['from', 'to']
    })
    .then(function(grps) {
      res.status(200).send({
        ok: true,
        items: grps.toJSON()
      });
      new Message()
        .query({
          where: {from_id: req.query.other_id, to_id: usr}
        })
        .save(
          {
            read: true
          },
          {method: 'update'}
        );
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        items: []
      });
    });
};

exports.newMsg = function(req, res, next) {
  new Message()
    .save({
      message: req.body.msg,
      to_id: req.body.to_id,
      from_id: req.user.id
    })
    .then(function() {
      res.status(200).send({
        ok: true,
        msg: 'Message Sent!'
      });

      let u_1 = req.user.id;
      let u_2 = req.body.to_id;
      if (u_2 < u_1) {
        const c = u_1;
        u_1 = u_2;
        u_2 = c;
      }
      if (req.body.cs) {
        new Groups().where({id: req.body.cs}).fetch(function(g_itm) {
          if (!g_itm) {
            return new Groups().save({
              user_1_id: u_1,
              user_2_id: u_2
            });
          } else {
            g_itm.save({
              created_at: new Date()
              // slt
            });
          }
        });
      } else {
        // console.log('here');
        new Groups()
          .query({
            where: {user_1_id: u_1, user_2_id: u_2},
            orWhere: {
              user_1_id: u_2,
              user_2_id: u_1
            }
          })
          .fetch()
          .then(function(g_itm) {
            if (!g_itm) {
              return new Groups()
                .save({
                  user_1_id: u_1,
                  user_2_id: u_2
                })
                .then(function(f) {
                  //
                })
                .catch(function(err) {
                  console.log('0---');
                  console.log(err);
                });
            } else {
              g_itm
                .save({
                  created_at: new Date()
                  // slt
                })
                .then(function(f) {
                  //
                })
                .catch(function(err) {
                  console.log(err);
                });
            }
          });
      }

      new User({id: req.body.to_id}).fetch().then(function(usr) {
        const email = usr.get('email');

        // new Notification().save({
        //   user_id: u_2,
        //   type: 'm_new'
        // });


      });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false
      });
    });
};
