// const fs = require('fs');
const Item = require('./Post');
const ItemUpvotes = require('./PostUpvotes');
const ItemComments = require('./PostComments');
const UsereFollower = require('../../models/UserFollower');
const moment = require('moment');

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
      // res.status(200).send({
      //   ok: true,
      //   msg: 'Added'
      // });
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
    })
    .catch(function(err) {
      // console.log(err);
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
        upvotes: function(qb) {
          qb.column('post_id').where('user_id', cur_u);
          // .where('subject_name', 'Question');
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
        upvotes: function(qb) {
          qb.column('post_id').where('user_id', cur_u);
          // .where('subject_name', 'Question');
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
        upvotes: function(qb) {
          qb.column('post_id').where('user_id', cur_u);
          // .where('subject_name', 'Question');
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
      // items.like_count = items.like_count  ?items.like_count.length : 0;
      return res.status(200).send({ok: true, items: items});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({ok: true, items: [], error: 'err'});
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
        upvotes: function(qb) {
          qb.column('post_id').where('user_id', cur_u);
          // .where('subject_name', 'Question');
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
        upvotes: function(qb) {
          qb.column('post_id').where('user_id', cur_u);
          // .where('subject_name', 'Question');
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
        upvotes: function(qb) {
          qb.column('post_id').where('user_id', cur_u);
          // .where('subject_name', 'Question');
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
    user_id: req.user.id
  })
    .save()
    .then(function(item) {
      res.send({ok: true, msg: 'Post Added.', post: item.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};
//
// exports.listItem = function(req, res, next) {
//   let n = new Item().orderBy('id', 'DESC');
//   if (req.query && req.query.topic_id) {
//     n = n.where({topic_id: req.query.topic_id});
//   }
//   n = n.withCount('thread_replies');
//   n.fetchAll({
//     withRelated: [
//       {
//         user: function(qb) {
//           qb.column(['id', 'username']);
//         }
//       }
//     ]
//   })
//     .then(function(items) {
//       if (!items) {
//         return res.status(200).send({ok: true, items: []});
//       }
//       return res.status(200).send({ok: true, items: items.toJSON()});
//     })
//     .catch(function(err) {
//       return res.status(200).send({ok: true, items: []});
//     });
// };
//
// exports.listPaged = function(req, res, next) {
//   let c = new Item();
//   c = c.orderBy('id', 'DESC');
//   if (req.query && req.query.topic_id) {
//     c = c.where({topic_id: req.query.topic_id});
//   }
//   let p;
//   if (req.query.paged && parseInt(req.query.paged) > 1) {
//     p = parseInt(req.query.paged);
//   } else {
//     p = 1;
//   }
//   c.fetchPage({page: p, pageSize: 10})
//     .then(function(items) {
//       if (!items) {
//         return res.status(200).send({ok: true, items: []});
//       }
//       return res
//         .status(200)
//         .send({ok: true, items: items.toJSON(), pagination: items.pagination});
//     })
//     .catch(function(err) {
//       // console.log(err)
//       return res.status(200).send({ok: true, items: []});
//     });
// };
//
// exports.listSingleItem = function(req, res, next) {
//   new Item()
//     .where('id', req.params.id)
//     .fetch({
//       withRelated: [
//         {
//           user: function(qb) {
//             qb.column(['id', 'username', 'first_name', 'last_name']);
//           }
//         }
//       ]
//     })
//     .then(function(item) {
//       if (!item) {
//         return res
//           .status(200)
//           .send({id: req.params.id, title: '', content: ''});
//       }
//       return res.status(200).send({ok: true, item: item.toJSON()});
//     })
//     .catch(function(err) {
//       return res.status(400).send({
//         id: req.params.id,
//         title: '',
//         content: '',
//         msg: 'Failed to fetch from db'
//       });
//     });
// };
//
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

// exports.updateItem = function(req, res, next) {
//   req.assert('title', 'Title cannot be blank').notEmpty();
//   // req.assert('content', 'Content cannot be blank').notEmpty();
//   // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
//   // req.assert('category_id', 'Category cannot be blank').notEmpty();
//
//   // console.log(req.body);
//   const errors = req.validationErrors();
//   if (errors) {
//     return res.status(400).send(errors);
//   }
//
//   const item = new Item({id: req.body.id});
//   const obj = {
//     title: req.body.title,
//     platform: req.body.platform,
//     image_url: req.body.image_url
//   };
//
//   if (req.body.remove_media) {
//     obj.image_url = '';
//   }
//   item
//     .save(obj)
//     .then(function(blg) {
//       blg
//         .fetch()
//         .then(function(bll) {
//           res.send({
//             item: bll.toJSON(),
//             msg: ObjName + ' has been updated.'
//           });
//         })
//         .catch(function(err) {
//           // console.log(err);
//           res
//             .status(400)
//             .send({msg: 'Something went wrong while updating the ' + ObjName});
//         });
//     })
//     .catch(function(err) {
//       // console.log(err);
//
//       res
//         .status(400)
//         .send({msg: 'Something went wrong while updating the ' + ObjName});
//     });
// };
//
// exports.deleteItem = function(req, res, next) {
//   new Item({id: req.body.id})
//     .destroy()
//     .then(function(post) {
//       res.send({msg: 'The ' + ObjName + ' has been successfully deleted.'});
//     })
//     .catch(function(err) {
//       return res
//         .status(400)
//         .send({msg: 'Something went wrong while deleting the ' + ObjName});
//     });
// };
