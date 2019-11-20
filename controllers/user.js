const async = require('async');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User');
const UserFollower = require('../models/UserFollower');
const mailer = require('./mailer');
const Notif = require('../models/Notification');
const Score = require('../models/Score');

function generateToken(user) {
  const payload = {
    iss: 'onlycompgaming.com',
    sub: user.id,
    iat: moment().unix(),
    exp: moment()
      .add(7, 'months')
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
  if (req.user) {
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

exports.loginPost = function(req, res, next) {
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new User()
    .query({
      where: {email: req.body.email},
      orWhere: {username: req.body.email}
    })
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
    status: true,
    email_verified: true
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
      // console.log(err);
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
    // req.assert('age', 'Age cannot be blank').notEmpty();
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
        dob: req.body.dob,
        gamer_tag_2: req.body.gamer_tag_2,
        gamer_tag_3: req.body.gamer_tag_3,
        gamer_tag_1: req.body.gamer_tag_1,
        gamer_tag_4: req.body.gamer_tag_4,
        gamer_tag_5: req.body.gamer_tag_5,
        gamer_tag_6: req.body.gamer_tag_6,
        timezone: req.body.timezone
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
            msg: 'Your password has been changed.',
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
        // console.log(err);
        if (err.code === 'ER_DUP_ENTRY') {
          res.status(409).send({
            msg:
              'The email address you have entered is already associated with another account.'
          });
        }
      });
  }, 2000);
};

exports.accountPic = function(req, res, next) {
  if (!req.body.profile_picture && !req.body.cover_picture) {
    return res.status(400).send({ok: false, msg: 'Image missing'});
  }
  const user = new User({id: req.user.id});
  user.fetch().then(function(user) {
    if (!user) {
      return;
    }
    user
      .save(req.body, {patch: true})
      .then(function(usr) {
        res.send({
          user: user,
          msg: 'Your profile information has been updated.'
        });
      })
      .catch(function(err) {
        // console.log(err);
        res.status(400).send({
          msg: 'Some error occoured'
        });
      });
  });
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
exports.listFollower = function(req, res, next) {
  const me = req.query.uid;
  new UserFollower()
    .where({
      user_id: me
    })
    .fetchAll({withRelated: ['follower']})
    .then(function(items) {
      res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      res.status(200).send({ok: true, items: []});
    });
};
exports.listFollowing = function(req, res, next) {
  const me = req.query.uid;
  new UserFollower()
    .where({
      follower_id: me
    })
    .fetchAll({withRelated: ['user']})
    .then(function(items) {
      res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      res.status(200).send({ok: true, items: []});
    });
};
exports.addFollower = function(req, res, next) {
  const me = req.user.id;
  const follow_to = req.body.follow_to;

  new UserFollower()
    .where({
      follower_id: me,
      user_id: follow_to
    })
    .fetch()
    .then(function(uf) {
      if (uf) {
        uf.destroy();
        res.status(200).send({ok: true, msg: 'Updated!'});
      } else {
        new UserFollower({
          follower_id: me,
          user_id: follow_to
        })
          .save()
          .then(function(uf) {
            new Notif()
              .save({
                user_id: follow_to,
                description: 'You have a new follower',
                type: 'follower',
                object_id: 1
              })
              .then(function() {})
              .catch(function(er) {
                console.log(er);
              });
          })
          .catch(function(err) {
            // console.log(err);
          });
        res.status(200).send({ok: true, msg: 'Updated!'});
      }
    })
    .catch(function(err) {
      res.status(400).send({ok: false, msg: 'Failed to update'});
    });
};

exports.singleUser_info = function(req, res, next) {
  const cur_u = req.user ? req.user.id : 99999999;
  // console.log(cur_u);
  new User()
    .where({
      username: req.query.uid
    })
    .fetch({
      withRelated: [
        'teamuser',
        {
          followers: function(qb) {
            qb.where('follower_id', cur_u);
          }
        },
        'followerCount',
        'followingCount',
        'score',
        {
          'score.ladder': function(qb) {
            qb.column('id', 'title');
          }
        },
        'xp_obj'
      ]
    })
    .then(function(usr) {
      console.log('here');
      if (!usr) {
        // console.log(err);
        return res.status(200).send({user_info: {}, ok: false});
      }
      const user = usr.toJSON();
      user.email = '';
      user.credit_balance = '';
      user.dob = '';
      user.role = '';
      user.stripe_user_id = '';
      user.cash_balance = '';
      user.followerCount = user.followerCount.length;
      user.followingCount = user.followingCount.length;
      res.status(200).send({
        user_info: user,
        ok: true
      });
      if (req.query.addViews == 'yes' && req.user.id != user.id) {
        usr
          .save(
            {
              profile_views: usr.get('profile_views') + 1
            },
            {patch: true}
          )
          .then(function() {
            console.log('done');
          })
          .catch(function(err) {
            console.log(err);
          });
      }
      return;
    })
    .catch(function(err) {
      console.log(err);
      return res.status(200).send({user_info: {}, ok: false});
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

exports.records = function(req, res, next) {
  const username = req.query.username;
  const duration = req.query.duration;
  if (!username || !duration) {
    return res.status(400).send({ok: false, msg: 'Invalid nubmer of params'});
  }
  new User()
    .where({
      username: username
    })
    .fetch()
    .then(function(usr) {
      if (!usr) {
        return res.status(400).send({ok: false, msg: 'No such username'});
      }
      usr = usr.toJSON();
      const user_id = usr.id;
      let scr = new Score();
      scr = scr.where({
        user_id: user_id
      });
      if (duration == 'season') {
        const year = moment().format('YYYY');
        const season = moment().format('Q');

        scr = scr.where({
          year: year,
          season: season
        });
      }
      scr
        .fetchAll({
          withRelated: ['ladder', 'ladder.game_info']
        })
        .then(function(items) {
          res.status(200).send({ok: true, records: items.toJSON()});
        })
        .catch(function(err) {
          console.log(err);
          return res.status(400).send({ok: false, msg: 'Failed to fetch'});
        });
    });
};

exports.authFacebookCallback = function(req, res) {
  res.render('loading');
};

exports.leaderboard_1 = function(req, res, next) {
  new User()
    .orderBy('life_xp', 'DESC')
    .orderBy('life_earning', 'DESC')
    .orderBy('id', 'DESC')
    .fetchPage({page: 1, pageSize: 100})
    .then(function(usrs) {
      return res.status(200).send({ok: true, items: usrs.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({ok: false, items: []});
    });
};

exports.leaderboard_2 = function(req, res, next) {
  new User()
    .orderBy('life_earning', 'DESC')
    .fetchPage({page: 1, pageSize: 100})
    .then(function(usrs) {
      return res.status(200).send({ok: true, items: usrs.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({ok: false, items: []});
    });
};

exports.resetScore = function(req, res, next) {
  const action = req.body.action;
  const year = moment().format('YYYY');
  const season = moment().format('Q');
  switch (action) {
    case 'overallScore':
      new User()
        .where({id: req.user.id})
        .save(
          {
            wins: 0,
            loss: 0
          },
          {
            patch: true
          }
        )
        .then(function(score) {
          return res.status(200).send({ok: true, msg: 'Score reset done.'});
        })
        .catch(function(err) {
          console.log(err);
          return res
            .status(400)
            .send({ok: false, msg: 'failed to reset score.'});
        });
      break;
    case 'score_life':
      new Score()
        .where({
          user_id: req.user.id
        })
        .destroy()
        .then(function() {
          return res.status(200).send({ok: false, msg: 'records reset done.'});
        })
        .catch(function() {
          return res.status(400).send({
            ok: false,
            msg: 'Failed to delete records or nothing to delete'
          });
        });
      break;
    case 'score_season':
      new Score()
        .where({
          user_id: req.user.id,
          year: year,
          season: season
        })
        .destroy()
        .then(function() {
          return res.status(200).send({ok: false, msg: 'records reset done.'});
        })
        .catch(function(err) {
          console.log(err);
          return res.status(400).send({
            ok: false,
            msg: 'Failed to delete records or nothing to delete'
          });
        });
      break;
    default:
      res.status(400).send({ok: false, msg: 'action not found'});
      break;
  }
};
