// const fs = require('fs');
const Item = require('./Post');
const ItemUpvotes = require('./PostUpvotes');
const ItemComments = require('./PostComments');
const UsereFollower = require('../../models/UserFollower');
const moment = require('moment');
const Notif = require('../../models/Notification');

exports.reactionsList = function(req, res, next) {
  new ItemUpvotes()
    .where({
      post_id: req.query.pid
    })
    .fetchAll({withRelated: 'user'})
    .then(function(items) {
      if (items) {
        res.status(200).send({ok: true, items: items.toJSON()});
      } else {
        res.status(200).send({ok: true, items: []});
      }
    })
    .catch(function(err) {
      console.log(err);
      res.status(200).send({ok: true, items: []});
    });
};

exports.new_comment = function(req, res, next) {
  const uid = req.user.id;
  const post_id = req.body.post_id;
  const comment = req.body.comment;
  new ItemComments()
    .save({
      user_id: uid,
      post_id: post_id,
      comment: comment
    })
    .then(function(ub) {
      res.send({ok: true, msg: 'Comment Added.', comment: ub.toJSON()});
      new Item()
        .where({id: post_id})
        .fetch()
        .then(function(post) {
          if (post) {
            new Notif()
              .save({
                user_id: post.get('user_id'),
                description: 'You have a comment on your post',
                type: 'post',
                object_id: post.id
              })
              .then(function() {})
              .catch(function(er) {
                console.log(er);
              });
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    })
    .catch(function(err) {
      res.status(400).send({
        ok: false,
        msg: 'Failed'
      });
    });
};

exports.upvote = function(req, res, next) {
  const uid = req.user.id;
  const post_id = req.body.post_id;

  new ItemUpvotes()
    .save({
      user_id: uid,
      post_id: post_id,
      type: req.body.type
    })
    .then(function(ub) {
      res.status(200).send({
        ok: true,
        msg: 'Upvoted'
      });
      new Item()
        .where({id: post_id})
        .fetch()
        .then(function(post) {
          if (post) {
            new Notif()
              .save({
                user_id: post.get('user_id'),
                description: 'You have a reaction on your post',
                type: 'post',
                object_id: post.id
              })
              .then(function() {})
              .catch(function(er) {
                console.log(er);
              });
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    })
    .catch(function(err) {
      res.status(400).send({
        ok: false,
        msg: 'Failed'
      });
    });
};

exports.downvote = function(req, res, next) {
  const uid = req.user.id;
  const post_id = req.body.post_id;

  new ItemUpvotes()
    .where({
      user_id: uid,
      post_id: post_id
    })
    .destroy()
    .then(function(ub) {
      res.status(200).send({
        ok: true,
        msg: 'Upvoted'
      });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed'
      });
    });
};

exports.getMyFollowing = function(req, res, next) {
  new UsereFollower()
    .where({
      follower_id: req.user.id
    })
    .fetchAll()
    .then(function(tasks) {
      tasks = tasks.toJSON();
      const feed_players = [];
      for (let i = 0; i < tasks.length; i++) {
        feed_players.push(tasks[i].user_id);
      }
      req.users_my_following = feed_players;
      next();
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'failed',
        items: []
      });
    });
};
exports.listSingleItem = function(req, res, next) {
  const cur_u = req.user.id ? req.user.id : 99999;
  new Item()
    .where({id: req.params.id})
    .fetch({
      withRelated: [
        {
          user: function(qb) {
            qb.column('id');
            qb.column('username');
            qb.column('first_name');
            qb.column('last_name');
            qb.column('profile_picture');
          }
        },
        {
          original_poster: function(qb) {
            qb.column('id');
            qb.column('username');
            qb.column('first_name');
            qb.column('last_name');
            qb.column('profile_picture');
          }
        },
        {
          upvotes: function(qb) {
            qb.column('post_id')
              .column('type')
              .where('user_id', cur_u);
          }
        },
        {
          'comments.user': function(qb) {
            qb.column('id');
            qb.column('username');
            qb.column('first_name');
            qb.column('last_name');
            qb.column('profile_picture');
          }
        },
        'like_count',
        'comments'
      ]
    })
    .then(function(item) {
      if (item) {
        res.status(200).send({ok: true, post: item.toJSON()});
      } else {
        res.status(400).send({ok: false, post: {}});
      }
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({ok: false, post: {}});
    });
};

exports.listItemMyFeed = function(req, res, next) {
  const cur_u = req.user.id ? req.user.id : 99999;
  const n = new Item()

    .orderBy('id', 'DESC')
    // .orderBy('is_pinned', 'ASC')
    .where('user_id', 'in', req.users_my_following);
  let p;
  if (req.query.paged && parseInt(req.query.paged) > 1) {
    p = parseInt(req.query.paged);
  } else {
    p = 1;
  }
  n.fetchPage({
    page: p,
    pageSize: 10,
    withRelated: [
      {
        user: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        original_poster: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        upvotes: function(qb) {
          qb.column('post_id')
            .column('type')
            .where('user_id', cur_u);
        }
      },
      {
        'comments.user': function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      'like_count',
      'comments'
    ]
  })
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: [], pagination: {}});
      }
      const pagination = items.pagination;
      items = items.toJSON();
      // console.log(items);
      // items.like_count = items.like_count ? items.like_count.length : 0;
      return res
        .status(200)
        .send({ok: true, items: items, pagination: pagination});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: [], pagination: {}});
    });
};

exports.listItemMy = function(req, res, next) {
  const cur_u = req.user.id ? req.user.id : 99999;
  const n = new Item()

    .orderBy('is_pinned', 'DESC')

    .orderBy('id', 'DESC')
    .where({
      user_id: req.query.uid ? req.query.uid : 0
    });
  let p;
  if (req.query.paged && parseInt(req.query.paged) > 1) {
    p = parseInt(req.query.paged);
  } else {
    p = 1;
  }
  n.fetchPage({
    page: p,
    pageSize: 10,
    withRelated: [
      {
        user: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        original_poster: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        upvotes: function(qb) {
          qb.column('post_id')
            .column('type')
            .where('user_id', cur_u);
        }
      },
      {
        'comments.user': function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      'like_count',
      'comments'
    ]
  })
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: []});
      }
      items = items.toJSON();
      // console.log(items);
      // items.like_count = items.like_count ? items.like_count.length : 0;
      return res.status(200).send({ok: true, items: items});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listItemAll = function(req, res, next) {
  const cur_u = req.user.id ? req.user.id : 99999;

  let n = new Item().orderBy('id', 'DESC');
  // .where({
  // user_id: req.user ? req.user.id : 0
  // });
  // console.log(req.query);
  if (req.query.hastag) {
    // console.log(req.query.hashtag);
    n = n.where('post', 'LIKE', '%' + req.query.hastag + '%');
  }
  n = n.where({is_private: false});
  let p;
  if (req.query.page && parseInt(req.query.page) > 1) {
    p = parseInt(req.query.page);
  } else {
    p = 1;
  }
  n.fetchPage({
    page: p,
    pageSize: 10,
    withRelated: [
      {
        user: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        original_poster: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        upvotes: function(qb) {
          qb.column('post_id')
            .column('type')
            .where('user_id', cur_u);
        }
      },
      {
        'comments.user': function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      'like_count',
      'comments'
    ]
  })
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: [], pagination: {}});
      }
      const pagination = items.pagination;
      items = items.toJSON();
      // console.log(items);
      // items.like_count = items.like_count  ?items.like_count.length : 0;
      return res
        .status(200)
        .send({ok: true, items: items, pagination: pagination});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(200)
        .send({ok: true, items: [], error: 'err', pagination: {}});
    });
};

exports.famousWeek = function(req, res, next) {
  const cur_u = req.user.id ? req.user.id : 99999;
  const n = new Item()
    .orderBy('id', 'DESC')
    .where('created_at', '>=', moment().subtract(7, 'days'))
    .where('video_url', '!=', '');

  n.fetchAll({
    withRelated: [
      {
        user: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        original_poster: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        upvotes: function(qb) {
          qb.column('post_id')
            .column('type')
            .where('user_id', cur_u);
        }
      },
      {
        'comments.user': function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      'like_count',
      'comments'
    ]
  })
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: []});
      }
      items = items.toJSON();
      let max = 0;
      let max_item = {};
      for (let i = 0; i < items.length; i++) {
        const like_count = items[i].like_count.length;
        const comment_count = items[i].comments.length;

        if (max < like_count + comment_count) {
          max = like_count + comment_count;
          max_item = items[i];
        }
      }
      req.week_famous = max_item;
      next();
      return;
      // return res.status(200).send({ok: true, items: items});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.famousDay = function(req, res, next) {
  const cur_u = req.user.id ? req.user.id : 99999;
  const n = new Item()
    .orderBy('id', 'DESC')
    .where('created_at', '>=', moment().subtract(1, 'days'))
    .where('video_url', '!=', '');

  n.fetchAll({
    withRelated: [
      {
        user: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        original_poster: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        upvotes: function(qb) {
          qb.column('post_id')
            .column('type')
            .where('user_id', cur_u);
        }
      },
      {
        'comments.user': function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      'like_count',
      'comments'
    ]
  })
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: []});
      }
      items = items.toJSON();
      let max = 0;
      let max_item = {};
      for (let i = 0; i < items.length; i++) {
        const like_count = items[i].like_count.length;
        const comment_count = items[i].comments.length;

        if (max < like_count + comment_count) {
          max = like_count + comment_count;
          max_item = items[i];
        }
      }
      req.week_famous = max_item;
      next();
      return;
      // return res.status(200).send({ok: true, items: items});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.famousMonth = function(req, res, next) {
  const cur_u = req.user.id ? req.user.id : 99999;
  const n = new Item()
    .orderBy('id', 'DESC')
    .where('created_at', '>=', moment().subtract(30, 'days'))
    .where('video_url', '!=', '');

  n.fetchAll({
    withRelated: [
      {
        user: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        original_poster: function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      {
        upvotes: function(qb) {
          qb.column('post_id')
            .column('type')
            .where('user_id', cur_u);
        }
      },
      {
        'comments.user': function(qb) {
          qb.column('id');
          qb.column('username');
          qb.column('first_name');
          qb.column('last_name');
          qb.column('profile_picture');
        }
      },
      'like_count',
      'comments'
    ]
  })
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: []});
      }
      items = items.toJSON();
      let max = 0;
      let max_item = {};
      for (let i = 0; i < items.length; i++) {
        const like_count = items[i].like_count.length;
        const comment_count = items[i].comments.length;

        if (max < like_count + comment_count) {
          max = like_count + comment_count;
          max_item = items[i];
        }
      }
      req.month_famous = max_item;
      // next();

      return res.status(200).send({
        ok: true,
        week_famous: req.week_famous,
        month_famous: req.month_famous
      });
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.addItem = function(req, res, next) {
  req.assert('content', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item({
    post: req.body.content,
    image_url: req.body.image_url ? req.body.image_url : '',
    video_url: req.body.video_url ? req.body.video_url : '',
    user_id: req.user.id,
    is_repost: req.body.is_repost ? true : false,
    is_private: req.body.is_private ? true : false,
    repost_of: req.body.is_repost ? req.body.repost_from : null,
    repost_of_user_id: req.body.is_repost ? req.body.repost_of_user_id : null
  })
    .save()
    .then(function(item) {
      res.send({ok: true, msg: 'Post Added.', post: item.toJSON()});
      if (req.body.is_repost) {
        new Item()
          .where({
            id: req.body.repost_from
          })
          .fetch()
          .then(function(item) {
            if (item) {
              item
                .save({repost_count: item.get('repost_count') + 1})
                .then(function() {})
                .catch(function(err) {
                  console.log(err);
                });
            }
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.doPin = function(req, res, next) {
  req.assert('post_id', 'ID cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const item = new Item({id: req.body.post_id, user_id: req.user.id});

  item
    .fetch()
    .then(function(itm_obj) {
      if (itm_obj) {
        itm_obj
          .save({
            is_pinned: !item.get('is_pinned')
          })
          .then(function(itm_obj) {
            res.status(200).send({ok: true, msg: 'done'});
          })
          .catch(function(err) {
            res
              .status(400)
              .send({msg: 'Something went wrong while updating the pin'});
          });
      } else {
        res.status(200).send({ok: true, msg: 'done'});
      }
    })
    .catch(function(err) {
      // console.log(err);

      res
        .status(400)
        .send({msg: 'Something went wrong while updating the pin'});
    });
};
