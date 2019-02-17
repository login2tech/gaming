const mailer = require('./mailer');

exports.contactGet = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

exports.contactPost = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  // req.assert('last_name', 'Last Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('message', 'Message cannot be blank').notEmpty();
  req.assert('subject', 'Subject cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({remove_dots: false});

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  res.send({msg: 'Thank you! Your feedback has been submitted.'});

  mailer.doMail(
    process.env.ADMIN_EMAIL,
    req.body.email,
    req.body.name,
    'Contact Form: ' + req.body.email,
    'Hi\n\nA new Contact form has been submitted on onlycompgaming. <br />Subject: ' +
      req.body.subject +
      '<br />Message: ' +
      req.body.message +
      '<br /><br />Regards'
  );
};
