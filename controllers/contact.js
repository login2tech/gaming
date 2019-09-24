const mailer = require('./mailer');
const FormAdvertise = require('../models/FormAdvertise');
const FormStaffApplication = require('../models/FormStaffApplication');
const FormSubscribe = require('../models/FormSubscribe');
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

exports.applySubscribe = function(req, res) {
  req.assert('email', 'Email is not valid').isEmail();
  req.sanitize('email').normalizeEmail({remove_dots: false});

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  res.send({msg: 'Thank you! You are now subscibed.'});

  new FormSubscribe()
    .save({
      email: req.body.email ? req.body.email : ''
    })
    .then(function() {
      return;
    })
    .catch(function(err) {
      console.log(err);
    });
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

  new FormAdvertise()
    .save({
      name: req.body.name ? req.body.name : '',
      email: req.body.email ? req.body.email : '',
      tel: req.body.tel ? req.body.tel : '',
      instagram: req.body.instagram ? req.body.instagram : '',
      you_are_a: req.body.you_are_a ? req.body.you_are_a : '',
      why: req.body.why ? req.body.why : ''
    })
    .then(function() {
      return;
    })
    .catch(function(err) {
      console.log(err);
    });
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
  // req.assert('message', 'Message cannot be blank').notEmpty();
  // req.assert('subject', 'Subject cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({remove_dots: false});

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  res.send({msg: 'Thank you! We will contact you shortly.'});

  new FormStaffApplication()
    .save({
      first_name: req.body.first_name ? req.body.first_name : '',
      last_name: req.body.last_name ? req.body.last_name : '',
      email: req.body.email ? req.body.email : '',
      address: req.body.address ? req.body.address : '',
      phone_number: req.body.phone_number ? req.body.phone_number : '',
      date_of_birth: req.body.date_of_birth ? req.body.date_of_birth : '',
      position: req.body.position ? req.body.position : '',
      about_yourself: req.body.about_yourself ? req.body.about_yourself : '',
      why_intested: req.body.why_intested ? req.body.why_intested : '',
      qualification: req.body.qualification ? req.body.qualification : '',
      why: req.body.why ? req.body.why : ''
    })
    .then(function() {
      return;
    })
    .catch(function(err) {
      console.log(err);
    });
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
