const async = require('async');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
// const request = require('request');
// const qs = require('querystring');
const User = require('../models/User');
const mailer = require('./mailer');

function generateToken(user) {
  const payload = {
    iss: 'onlycompgaming.com',
    sub: user.id,
    iat: moment().unix(),
    exp: moment()
      .add(7, 'days')
      .unix()
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET);
}

function sendMailToActivate(req, user) {
  const site_url = process.env.SITE_URL || 'http://onlycompgaming.com';
  const link =
    site_url + '/activate/' + user.id + '/' + moment(user.created_at).unix();

  mailer.doMail(
    user.email,
    false,
    false,
    'Verify your email',
    'Hi<br /><br />Please click on the link below to verify your email and activate your onlycompgaming account:  <br /><br /><a  target="_blank" href="' +
      link +
      '">' +
      link +
      '</a><br /><br />Regards'
  );
}

exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({msg: 'Unauthorized'});
  }
};

exports.isAdmin = function(req, res, next) {
  if (req.user && req.user.role == 'admin') {
    next();
  } else {
    res.status(401).send({msg: 'Unauthorized Access'});
  }
};
/**
 * POST /login
 * Sign in with email and password
 */
exports.loginPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({remove_dots: false});

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new User({email: req.body.email})
    .fetch()
    .then(function(user) {
      if (!user) {
        return res.status(401).send({
          msg:
            'The email address ' +
            req.body.email +
            ' is not associated with any account. ' +
            'Double-check your email address and try again.'
        });
      }
      if (user.get('email_verified') == false) {
        res.status(401).send({
          msg:
            'You need to verify your email by clicking on the link we sent you. We have re-sent you the verification mail.'
        });

        sendMailToActivate(req, user.toJSON());
        return;
      }
      if (user.get('status') == false) {
        return res
          .status(401)
          .send({msg: 'Your Account is currently not active.'});
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({msg: 'Invalid email or password'});
        }
        if (req.body.should_be) {
          if (user.get('role') == req.body.should_be) {
            res.send({token: generateToken(user), user: user.toJSON()});
          } else {
            return res
              .status(401)
              .send({msg: 'You dont have permissions to perform this action.'});
          }
        } else {
          user = user.toJSON();

          res.send({token: generateToken(user), user: user});
        }
      });
    })
    .catch(function(err) {
      res.send({ok: false, msg: 'some error occoured'});
    });
};

exports.resend = function(req, res, next) {
  const uid = req.query.uid;
  // console.log(uid);
  new User({id: uid}).fetch().then(function(user) {
    if (!user) {
      res.status(400).send({ok: false});
    }
    sendMailToActivate(req, user.toJSON());
    res.status(200).send({ok: true});
    return;
  });
};

exports.signupPost = function(req, res, next) {
  req.assert('first_name', 'First Name cannot be blank').notEmpty();
  req.assert('last_name', 'Last Name cannot be blank').notEmpty();
  req.assert('username', 'Username cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 6 characters long').len(6);
  req
    .assert(
      'password_confirm',
      'Confirm Password must be at least 6 characters long'
    )
    .len(6);
  req.sanitize('email').normalizeEmail({remove_dots: false});

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }
  if (req.body.password != req.body.password_confirm) {
    res.status(400).send({msg: 'Password and Confirm password do not match'});
    return;
  }

  new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    gender: req.body.gender,
    dob: req.body.dob,
    role: 'user',
    status: true
  })
    .save()
    .then(function(user) {
      res.send({
        msg:
          'Your Account has been successfully created. To Activate your account, please click on the activation link in the mail we have sent you.',
        user: user.toJSON()
      });
      sendMailToActivate(req, user.toJSON());
      return;
    })
    .catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        return res.status(400).send({
          msg:
            'The email address you have entered is already associated with another account.'
        });
      } else {
        // console.log(err);
        return res.status(400).send({
          msg: 'Something went wrong'
        });
      }
    });
};

/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function(req, res, next) {
  if ('password' in req.body) {
    req
      .assert('password', 'Password must be at least 4 characters long')
      .len(4);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);
  } else {
    // req.assert('email', 'Email is not valid').isEmail();
    req.assert('first_name', 'First Name cannot be blank').notEmpty();
    req.assert('last_name', 'Last Name cannot be blank').notEmpty();
    req.assert('gender', 'Gender cannot be blank').notEmpty();
    req.assert('dob', 'dob cannot be blank').notEmpty();
    // req.sanitize('email').normalizeEmail({remove_dots: false});
  }

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  const user = new User({id: req.user.id});
  if ('password' in req.body) {
    user.save({password: req.body.password}, {patch: true});
  } else {
    user.save(
      {
        // email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        dob: req.body.dob
      },
      {patch: true}
    );
  }
  setTimeout(function() {
    user
      .fetch()
      .then(function(user) {
        if ('password' in req.body) {
          res.send({
            m: {
              msg: 'Your password has been changed.'
            },
            user: user.toJSON()
          });
        } else {
          res.send({
            user: user,
            msg: 'Your profile information has been updated.'
          });
        }
        res.redirect('/account');
      })
      .catch(function(err) {
        if (err.code === 'ER_DUP_ENTRY') {
          res.status(409).send({
            msg:
              'The email address you have entered is already associated with another account.'
          });
        }
      });
  }, 500);
};

/**
 * DELETE /account
 */
exports.accountDelete = function(req, res, next) {
  new User({id: req.user.id}).destroy().then(function(user) {
    res.send({msg: 'Your account has been permanently deleted.'});
  });
};

/**
 * GET /unlink/:provider
 */
exports.unlink = function(req, res, next) {
  new User({id: req.user.id}).fetch().then(function(user) {
    switch (req.params.provider) {
      case 'facebook':
        user.set('facebook', null);
        break;
      default:
        return res.status(400).send({msg: 'Invalid OAuth Provider'});
    }
    user.save(user.changed, {patch: true}).then(function() {
      res.send({msg: 'Your account has been unlinked.'});
    });
  });
};

/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({remove_dots: false});

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      new User({email: req.body.email}).fetch().then(function(user) {
        if (!user) {
          return res.status(400).send({
            msg:
              'The email address ' +
              req.body.email +
              ' is not associated with any account.'
          });
        }
        user.set('passwordResetToken', token);
        user.set('passwordResetExpires', new Date(Date.now() + 3600000)); // expire in 1 hour
        user.save(user.changed, {patch: true}).then(function() {
          done(null, token, user.toJSON());
        });
      });
    },
    function(token, user, done) {
      res.send({
        msg:
          'An email has been sent to ' +
          user.email +
          ' with further instructions.'
      });
      const site_url = process.env.SITE_URL || 'http://onlycompgaming.com';
      const link = site_url + '/reset/' + token;
      mailer.doMail(
        user.email,
        false,
        false,
        'Reset your password',
        'You are receiving this email because you (or someone else) have requested the reset of the password for your account.<br /><br />' +
          'Please click on the following link, or paste this into your browser to complete the process:<br /><br /><a target="_blank" href="' +
          link +
          '">' +
          link +
          '</a><br /><br />' +
          'If you did not request this, please ignore this email and your password will remain unchanged.' +
          '<br /><br />Regards'
      );
    }
  ]);
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  async.waterfall([
    function(done) {
      new User({passwordResetToken: req.params.token})
        .where('passwordResetExpires', '>', new Date())
        .fetch()
        .then(function(user) {
          if (!user) {
            return res
              .status(400)
              .send({msg: 'Password reset token is invalid or has expired.'});
          }
          user.set('password', req.body.password);
          user.set('passwordResetToken', null);
          user.set('passwordResetExpires', null);
          user.save(user.changed, {patch: true}).then(function() {
            done(null, user.toJSON());
          });
        });
    },
    function(user, done) {
      res.send({msg: 'Your password has been changed successfully.'});

      // const site_url = process.env.SITE_URL || 'http://onlycompgaming.com';
      mailer.doMail(
        user.email,
        false,
        false,
        'Password Changed',
        'Hello,<br /><br />' +
          'This is a confirmation that the password for your account ' +
          user.email +
          ' has just been changed.' +
          '<br /><br />Regards'
      );
    }
  ]);
};

exports.listUsers = function(req, res, next) {
  new User()
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(users) {
      if (!users) {
        return res.status(200).send([]);
      }
      return res.status(200).send({users: users.toJSON(), ok: true});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.deleteUser = function(req, res, next) {
  new User({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The User has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the User'});
    });
};

exports.banUser = function(req, res, next) {
  const user = new User({id: req.body.id});

  if (user) {
    user
      .save(
        {
          status: false
        },
        {patch: true}
      )
      .then(function() {
        user
          .fetch()
          .then(function(user) {
            res.send({user: user, msg: 'User has been updated.'});
          })
          .catch(function(err) {
            res
              .status(400)
              .send({msg: 'Something went wrong while updating the User'});
          });
      })
      .catch(function(err) {
        res
          .status(400)
          .send({msg: 'Something went wrong while updating the User'});
      });
  } else {
    res.status(400).send({msg: 'Something went wrong while updating the User'});
  }
};

exports.makeAdmin = function(req, res, next) {
  const user = new User({id: req.body.id});

  if (user) {
    user
      .save(
        {
          role: 'admin'
        },
        {patch: true}
      )
      .then(function() {
        user
          .fetch()
          .then(function(user) {
            res.send({user: user, msg: 'User has been made admin.'});
          })
          .catch(function(err) {
            res
              .status(400)
              .send({msg: 'Something went wrong while updating the User'});
          });
      })
      .catch(function(err) {
        res
          .status(400)
          .send({msg: 'Something went wrong while updating the User'});
      });
  } else {
    res.status(400).send({msg: 'Something went wrong while updating the User'});
  }
};

exports.activateUser = function(req, res, next) {
  // console.log('514');
  new User({id: req.params.id})
    .fetch()
    .then(function(usr) {
      // console.log('516 ',req.params );
      if (usr) {
        // console.log('519');
        if (moment(usr.get('created_at')).unix() == req.params.timestamp) {
          // console.log('522');

          usr
            .save({email_verified: true}, {patch: true})
            .then(function(usr) {
              if (usr.status == true) {
                const token = generateToken(usr);
                res.cookie('satellizer_token', token, {
                  path: '/',
                  maxdob: 90000000,
                  httpOnly: false
                });
                res.cookie('token', token, {
                  path: '/',
                  maxdob: 90000000,
                  httpOnly: false
                });
                res.redirect('/plans');
              } else {
                res.redirect('/login');
              }
            })
            .catch(function(err) {
              // console.log(err)
              res.status(200).send('unable to save, please contact admin');
            });
        } else {
          res.status(200).send('invalid link');
        }
      } else {
        res.status(200).send('invalid user link');
      }
    })
    .catch(function(err) {
      // console.log(err);

      res.status(200).send('unable to fetch, please contact admin');
    });
};

exports.unbanUser = function(req, res, next) {
  const user = new User({id: req.body.id});

  if (user) {
    user
      .save(
        {
          status: true
        },
        {patch: true}
      )
      .then(function() {
        user
          .fetch()
          .then(function(user) {
            res.send({user: user, msg: 'User has been updated.'});
          })
          .catch(function(err) {
            res
              .status(400)
              .send({msg: 'Something went wrong while updating the User'});
          });
      })
      .catch(function(err) {
        res
          .status(400)
          .send({msg: 'Something went wrong while updating the User'});
      });
  } else {
    res.status(400).send({msg: 'Something went wrong while updating the User'});
  }
};

/**
 * POST /auth/facebook
 * Sign in with Facebook
 //  */
// exports.authFacebook = function(req, res) {
//   const profileFields = ['id', 'name', 'email', 'gender', 'location'];
//   const accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
//   const graphApiUrl =
//     'https://graph.facebook.com/v2.5/me?fields=' + profileFields.join(',');
//
//   const params = {
//     code: req.body.code,
//     client_id: req.body.clientId,
//     client_secret: process.env.FACEBOOK_SECRET,
//     redirect_uri: req.body.redirectUri
//   };
//
//   // Step 1. Exchange authorization code for access token.
//   request.get({url: accessTokenUrl, qs: params, json: true}, function(
//     err,
//     response,
//     accessToken
//   ) {
//     if (accessToken.error) {
//       return res.status(500).send({msg: accessToken.error.messdob});
//     }
//
//     // Step 2. Retrieve user's profile information.
//     request.get({url: graphApiUrl, qs: accessToken, json: true}, function(
//       err,
//       response,
//       profile
//     ) {
//       if (profile.error) {
//         return res.status(500).send({msg: profile.error.messdob});
//       }
//
//       // Step 3a. Link accounts if user is authenticated.
//       if (req.isAuthenticated()) {
//         new User({facebook: profile.id}).fetch().then(function(user) {
//           if (user) {
//             return res.status(409).send({
//               msg:
//                 'There is already an existing account linked with Facebook that belongs to you.'
//             });
//           }
//           user = req.user;
//           user.set('name', user.get('name') || profile.name);
//           user.set('gender', user.get('gender') || profile.gender);
//           user.set(
//             'picture',
//             user.get('picture') ||
//               'https://graph.facebook.com/' + profile.id + '/picture?type=large'
//           );
//           user.set('facebook', profile.id);
//           user.save(user.changed, {patch: true}).then(function() {
//             res.send({token: generateToken(user), user: user});
//           });
//         });
//       } else {
//         // Step 3b. Create a new user account or return an existing one.
//         new User({facebook: profile.id}).fetch().then(function(user) {
//           if (user) {
//             return res.send({token: generateToken(user), user: user});
//           }
//           new User({email: profile.email}).fetch().then(function(user) {
//             if (user) {
//               return res.status(400).send({
//                 msg:
//                   user.get('email') +
//                   ' is already associated with another account.'
//               });
//             }
//             user = new User();
//             user.set('name', profile.name);
//             user.set('email', profile.email);
//             user.set('gender', profile.gender);
//             user.set('location', profile.location && profile.location.name);
//             user.set(
//               'picture',
//               'https://graph.facebook.com/' + profile.id + '/picture?type=large'
//             );
//             user.set('facebook', profile.id);
//             user.save().then(function(user) {
//               return res.send({token: generateToken(user), user: user});
//             });
//           });
//         });
//       }
//     });
//   });
// };

exports.authFacebookCallback = function(req, res) {
  res.render('loading');
};
