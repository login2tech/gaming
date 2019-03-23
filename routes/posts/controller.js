// const fs = require('fs');
const Item = require('./Post');
const ObjName = 'Thread';

exports.listItemMy = function(req, res, next) {
  const n = new Item().orderBy('id', 'DESC').where({
    user_id: req.user ? req.user.id : 0
  });
  let p;
  if (req.query.paged && parseInt(req.query.paged) > 1) {
    p = parseInt(req.query.paged);
  } else {
    p = 1;
  }
  n.fetchPage({page: p, pageSize: 10})
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
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
      console.log(err);
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
