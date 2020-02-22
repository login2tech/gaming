const Faq = require('../models/Faq');

exports.deleteFaq = function(req, res, next) {
  new Faq({id: req.body.id})
    .destroy()
    .then(function(user) {
      res.send({ok: true, msg: 'The FAQ Item has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the FAQ item'});
    });
};

exports.updateFaq = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();

  req.assert('content', 'Content cannot be blank').notEmpty();

  // req.assert('category' , 'Category cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const faq = new Faq({id: req.body.id});

  faq.save({
    title: req.body.title,

    content: req.body.content
  });

  faq
    .fetch()
    .then(function(faq) {
      res.send({faq: faq, ok: true, msg: 'FAQ item has been updated.'});
    })
    .catch(function(err) {
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the FAQ item'});
    });
};

exports.addFaq = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();

  req.assert('content', 'Content cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new Faq({
    title: req.body.title,
    content: req.body.content
  })
    .save()
    .then(function(user) {
      res.send({ok: true, msg: 'New FAQ item has been created successfully.'});
    })
    .catch(function(err) {
      // console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new FAQ item'});
    });
};

exports.listFaq = function(req, res, next) {
  new Faq()
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(faqs) {
      if (!faqs) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, faqs: faqs.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.listSingleFaq = function(req, res, next) {
  new Faq()
    .where('id', req.params.id)
    .fetch()
    .then(function(faq) {
      if (!faq) {
        return res
          .status(200)
          .send({id: req.params.id, title: '', content: ''});
      }
      return res.status(200).send({ok: true, faq: faq.toJSON()});
    })
    .catch(function(err) {
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'failed to fetch from db'
      });
    });
};
