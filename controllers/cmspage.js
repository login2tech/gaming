const CMSPage = require('../models/CMSPage');

exports.deleteCMSPage = function(req, res, next) {
  new CMSPage({id: req.body.id})
    .destroy()
    .then(function(user) {
      res.send({msg: 'The CMSPage has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the CMSPage listing'});
    });
};

exports.updateCMSPage = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('content', 'Content cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const cms_page = new CMSPage({id: req.body.id});

  cms_page
    .save({
      title: req.body.title,
      content: req.body.content,
      slug: req.body.slug,
      is_in_link: req.body.is_in_link
    })
    .then(function(cms_page) {
      cms_page
        .fetch()
        .then(function() {
          res.send({
            cms_page: cms_page,
            msg: 'CMS Page listing has been updated.'
          });
        })
        .catch(function(err) {
          // console.log(err);
          res.status(400).send({
            msg: 'Something went wrong while updating the CMSPage listing'
          });
        });
    })
    .catch(function(err) {
      console.log(err);
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the CMSPage listing'});
    });
};

exports.addCMSPage = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('content', 'Content cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new CMSPage({
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    is_in_link: req.body.is_in_link
  })
    .save()
    .then(function(cms_page) {
      res.send({
        ok: true,
        msg: 'New CMS Page listing has been created successfully.'
      });
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({
        msg: 'Something went wrong while created a new CMSPage listing'
      });
    });
};

exports.listCMSPage = function(req, res, next) {
  new CMSPage()
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(cms_pages) {
      if (!cms_pages) {
        return res.status(200).send({cms_pages: [], user: req.user});
      }
      return res.status(200).send({ok: true, cms_pages: cms_pages.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send({cms_pages: [], user: req.user});
    });
};

exports.listSingleCMSPageSlug = function(req, res, next) {
  new CMSPage()
    .where('slug', req.params.slug)
    .fetch()
    .then(function(cms_page) {
      if (!cms_page) {
        return res
          .status(200)
          .send({ok: false, id: req.params.id, title: '', description: ''});
      }
      return res.status(200).send({ok: true, cms_page: cms_page.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send({
        ok: false,
        id: req.params.id,
        title: '',
        description: '',
        msg: 'failed to fetch from db'
      });
    });
};
exports.getFooterLink = function(req, res, next) {
  new CMSPage()
    .where({is_in_link: 'yes'})
    .fetchAll()
    .then(function(cms_pages) {
      if (!cms_pages) {
        return res.status(200).send({ok: true, pages: []});
      }
      return res.status(200).send({ok: true, pages: cms_pages.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send({ok: true, pages: []});
    });
};

exports.listSingleCMSPage = function(req, res, next) {
  new CMSPage()
    .where('id', req.params.id)
    .fetch()
    .then(function(cms_page) {
      if (!cms_page) {
        return res
          .status(200)
          .send({id: req.params.id, title: '', description: ''});
      }
      return res.status(200).send({ok: true, cms_page: cms_page.toJSON()});
    })
    .catch(function(err) {
      return res.status(400).send({
        id: req.params.id,
        title: '',
        description: '',
        msg: 'failed to fetch from db'
      });
    });
};
