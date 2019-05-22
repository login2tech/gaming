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

exports.contactAdvertiseWithUs = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  // req.assert('last_name', 'Last Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('tel', 'Phone Number cannot be blank').notEmpty();
  req
    .assert('why', 'Why do you want to partner with Only Comp Gaming?')
    .notEmpty();
  req.assert('you_are_a', 'Please specify your role.').notEmpty();

  req.sanitize('email').normalizeEmail({remove_dots: false});

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  res.send({msg: 'Thank you! We will contact you shortly.'});

  mailer.doMail(
    process.env.ADMIN_EMAIL,
    req.body.email,
    req.body.name,
    'Advertise With Us: ' + req.body.email,
    'Hi\n\nA new Advertise Form has been submitted on onlycompgaming. <br />Email: ' +
      req.body.email +
      '<br />Name: ' +
      req.body.name +
      '<br />Phone Number: ' +
      req.body.tel +
      '<br />Role: ' +
      req.body.you_are_a +
      '<br />Instagram: ' +
      (req.body.instagram ? req.body.instagram : '') +
      '<br />  Why do you want to partner with Only Comp Gaming?: ' +
      req.body.why +
      '<br /><br />Regards'
  );
};

exports.contactApplyForStaff = function(req, res) {
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

  res.send({msg: 'Thank you! We will contact you shortly.'});

  mailer.doMail(
    process.env.ADMIN_EMAIL,
    req.body.email,
    req.body.name,
    'Apply For Staff: ' + req.body.email,
    'Hi\n\nA new "Apply For Staff" form has been submitted on onlycompgaming. <br />Subject: ' +
      req.body.subject +
      '<br />Message: ' +
      req.body.message +
      '<br /><br />Regards'
  );
};
