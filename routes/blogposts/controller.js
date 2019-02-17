const fs = require('fs');
const BlogPost = require('./BlogPost');

exports.listBlogPost = function(req, res, next) {
  new BlogPost()
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['category']})
    .then(function(posts) {
      if (!posts) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, posts: posts.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.listPaged = function(req, res, next) {
  let c = new BlogPost();
  c = c.orderBy('id', 'DESC');
  if (req.query.category_id) {
    c = c.where('category_id', 'LIKE', req.query.category_id);
  }
  let p;
  if (req.query.paged && parseInt(req.query.paged) > 1) {
    p = parseInt(req.query.paged);
  } else {
    p = 1;
  }
  c.fetchPage({page: p, pageSize: 10, withRelated: ['category']})
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

exports.listSingleBlogPost = function(req, res, next) {
  new BlogPost()
    .where('id', req.params.id)
    .fetch({withRelated: ['category']})
    .then(function(blogpost) {
      if (!blogpost) {
        return res
          .status(200)
          .send({id: req.params.id, title: '', content: ''});
      }
      return res.status(200).send({ok: true, blogpost: blogpost.toJSON()});
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

exports.addBlogPost = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('content', 'Content cannot be blank').notEmpty();
  req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new BlogPost({
    title: req.body.title,
    slug: req.body.slug,
    content: req.body.content,
    category_id: req.body.category_id,
    short_content: req.body.short_content
  })
    .save()
    .then(function(blogpost) {
      res.send({ok: true, msg: 'New Blog Post has been created successfully.'});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Blog Post'});
    });
};

exports.updateBlogPost = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('content', 'Content cannot be blank').notEmpty();
  req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  req.assert('category_id', 'Category cannot be blank').notEmpty();

  // console.log(req.body);
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const blogpost = new BlogPost({id: req.body.id});
  const obj = {
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    category_id: req.body.category_id,
    short_content: req.body.short_content,
    image_url: req.body.image_url
  };

  if (req.body.remove_media) {
    obj.image_url = '';
  }
  blogpost
    .save(obj)
    .then(function(blg) {
      blg
        .fetch()
        .then(function(bll) {
          res.send({
            blogpost: bll.toJSON(),
            msg: 'Blog Post has been updated.'
          });
        })
        .catch(function() {
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the Blog Post'});
        });
    })
    .catch(function() {
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the Blog Post'});
    });
};

exports.deleteBlogPost = function(req, res, next) {
  new BlogPost({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The Blog Post Item has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the Blog Post'});
    });
};

exports.updateBlogPostImage = function(req, res, next) {
  let data = req.body.data;
  data = JSON.parse(data);
  if (req.file && req.file.path) {
    // console.log(req.file)
    const path = req.file.filename;
    let name = req.file.originalname;
    name = name.split('.');
    name = name[name.length - 1];
    fs.renameSync(
      'uploads/images/' + path,
      'uploads/images/key_' + path + '.' + name
    );

    const booking = new BlogPost()
      .where({
        id: data.id
      })
      .fetch()
      .then(function(booking) {
        if (!booking) {
          return res.status(400).send({
            msg: 'Something went wrong while uploading File'
          });
        }
        booking
          .save({
            image_url: 'key_' + path + '.' + name
          })
          .then(function(settings) {
            res.send({
              post: settings,
              msg: 'Image uploaded successfully.'
            });
          })
          .catch(function(err) {
            //console.log('---')
            console.log(err);
            res.status(400).send({
              msg: 'Something went wrong while uploading File'
            });
          });
      })
      .catch(function(err) {
        console.log(err);
        res.status(400).send({
          msg: 'Something went wrong while uploading File'
        });
      });
  }
};
