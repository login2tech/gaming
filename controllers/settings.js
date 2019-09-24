const fs = require('fs');
const Settings = require('../models/Settings');

exports.deleteSettings = function(req, res, next) {
  new Settings({id: req.body.id})
    .destroy()
    .then(function(user) {
      res.send({msg: 'The settings has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the QA item'});
    });
};

exports.create_SATOSHIS = function(req, res, next) {
  const s = [
    {
      key: 'facebook_url',
      type: 'url',
      label: 'Facebook U.R.L.',
      content: 'http://facebook.com',
      page: 'Contact Details'
    },
    {
      key: 'twitter_url',
      type: 'url',
      label: 'Twitter U.R.L.',
      content: 'http://twitter.com',
      page: 'Contact Details'
    },
    {
      key: 'linkedin_url',
      type: 'url',
      label: 'Linkedin U.R.L.',
      content: 'http://linkedin.com',
      page: 'Contact Details'
    },
    {
      key: 'instagram_url',
      type: 'url',
      label: 'Instagram U.R.L.',
      content: 'http://instagram.com',
      page: 'Contact Details'
    },

    {
      key: 'stripe_live_publishable_key',
      type: 'text',
      label: 'Stripe Live Publishable Key',
      content: 'pk_live_',
      page: 'Stripe'
    },

    {
      key: 'stripe_test_publishable_key',
      type: 'text',
      label: 'Stripe Test Publishable Key',
      content: 'pk_test_',
      page: 'Stripe'
    },
    {
      key: 'stripe_mode',
      type: 'text',
      label: 'Stripe Mode ( test / live )',
      content: 'test',
      page: 'Stripe'
    }
  ];

  for (let i = 0; i < s.length; i++) {
    new Settings(s[i])
      .save()
      .then()
      .catch(function(r) {});
  }
  res.status(200).send('okkkkk');
};

exports.updateSettingsFile = function(req, res, next) {
  // console.log(req.body.data)
  let data = req.body.data;
  data = JSON.parse(data);
  if (req.file.path) {
    // console.log(req.file)
    const path = req.file.filename;
    let name = req.file.originalname;
    name = name.split('.');
    name = name[name.length - 1];
    fs.renameSync(
      'uploads/images/' + path,
      'uploads/images/key_' + path + '.' + name
    );

    const booking = new Settings()
      .where({
        key: data.key
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
            content: 'key_' + path + '.' + name
          })
          .then(function(settings) {
            res.send({
              settings: settings,
              msg: 'Image uploaded successfully.'
            });
          })
          .catch(function(err) {
            res.status(400).send({
              msg: 'Something went wrong while uploading File'
            });
          });
      })
      .catch(function(err) {
        res.status(400).send({
          msg: 'Something went wrong while uploading File'
        });
      });
  }
};

exports.updateSettings = function(req, res, next) {
  req.assert('content', 'Content cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const settings = new Settings({id: req.body.id});

  settings.save({
    // title   : req.body.title,
    content: req.body.content,
    content_hebrew: req.body.content_hebrew
  });

  settings
    .fetch()
    .then(function(settings) {
      res.send({settings: settings, msg: 'settings has been updated.'});
    })
    .catch(function(err) {
      res
        .status(400)
        .send({msg: 'Something went wrong while updating the settings'});
    });
};

exports.addSettings = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new Settings({
    // title   : req.body.tit
    content: req.body.content,
    content_hebrew: req.body.content_hebrew
  })
    .save()
    .then(function(settings) {
      res.send({ok: true, msg: 'New settings has been created successfully.'});
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new settings'});
    });
};

exports.listSettings = function(req, res, next) {
  new Settings()
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(settings) {
      if (!settings) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, settings: settings.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.listSettingsDefault = function(req, res, next) {
  new Settings()
    .orderBy('id', 'DESC')
    .where('autoload', true)
    .fetchAll()
    .then(function(settings) {
      if (!settings) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, settings: settings.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.listSingleSettings = function(req, res, next) {
  new Settings()
    .where('id', req.params.id)
    .fetch()
    .then(function(settings) {
      if (!settings) {
        return res.status(200).send({id: req.params.id, title: ''});
      }
      return res.status(200).send({ok: true, settings: settings.toJSON()});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({id: req.params.id, title: '', msg: 'failed to fetch from db'});
    });
};
