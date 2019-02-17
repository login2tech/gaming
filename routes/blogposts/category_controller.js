const Category = require('./Category');

exports.deleteCategory = function(req, res, next) {
  new Category({id: req.body.id})
    .destroy()
    .then(function(user) {
      res.send({msg: 'The category has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the category'});
    });
};

exports.updateCategory = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const category = new Category({id: req.body.id});

  category.save({
    title: req.body.title
  });

  category
    .fetch()
    .then(function(category) {
      res.send({category: category, msg: 'category has been updated.'});
    })
    .catch(function(err) {
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the category'});
    });
};

exports.addCategory = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new Category({
    title: req.body.title
  })
    .save()
    .then(function(category) {
      res.send({ok: true, msg: 'New category has been created successfully.'});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new category'});
    });
};

exports.listCategory = function(req, res, next) {
  new Category()
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(category) {
      if (!category) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, categories: category.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.listSingleCategory = function(req, res, next) {
  new Category()
    .where('id', req.params.id)
    .fetch()
    .then(function(category) {
      if (!category) {
        return res.status(200).send({id: req.params.id, title: ''});
      }
      return res.status(200).send({ok: true, category: category.toJSON()});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({id: req.params.id, title: '', msg: 'failed to fetch from db'});
    });
};
