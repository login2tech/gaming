const async = require('async');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User');
const UserFollower = require('../models/UserFollower');
const mailer = require('./mailer');
const Notif = require('../models/Notification');
const Score = require('../models/Score');
const XP = require('../models/XP');
const utils = require('../routes/utils');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const Trophy = require('../routes/tournaments/Trophy');

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
  let val = req.body.email;
  val = val.trim();
  val = val.toLowerCase();
  new User()
    .query(function(qb) {
      qb.where({email: val});
      qb.orWhere('username', 'ILIKE', val);
    })
    .fetch()
    .then(function(user) {
      if (!user) {
        return res.status(401).send({
          msg:
            'The email address / username ' +
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
        return res.status(401).send({
          banned: true,
          msg: 'Your Account is currently not active.',
          ban_reason: user.get('ban_reason'),
          ban_date: user.get('ban_date'),
          uname: user.get('username'),
          uid: user.get('id')
        });
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
  req.assert('password', 'Password must be at least 7 characters long').len(7);
  req.assert('username', 'Username must be atleast 3 characters long').len(3);
  req
    .assert(
      'password_confirm',
      'Confirm Password must be at least 7 characters long'
    )
    .len(7);
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
    username: req.body.username ? req.body.username : '',
    password: req.body.password,
    gender: req.body.gender,
    dob: req.body.dob,
    role: 'user',
    timezone : req.body.timezone,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    state: req.body.state ? req.body.state : '',
    country: req.body.country ? req.body.country : '',
    status: true,
    email_verified: false
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
      .assert('password', 'Password must be at least 7 characters long')
      .len(7);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);
    req.assert('old_password', 'Please enter old password').notEmpty();
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
    user.fetch().then(function(user) {
      user.comparePassword(req.body.old_password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({msg: 'Invalid old password'});
        }
        user
          .save({password: req.body.password}, {patch: true})
          .then(function(user) {
            return res.send({
              msg: 'Your password has been changed.',
              user: user.toJSON()
            });
          })
          .catch(function() {
            return res.status(400).send({
              msg: 'Failed to update password.',
              user: user.toJSON()
            });
          });
      });
    });
  } else {
    user
      .save(
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
          state: req.body.state ? req.body.state : '',
          gamer_tag_6: req.body.gamer_tag_6,
          timezone: req.body.timezone
        },
        {patch: true, method: 'update'}
      )
      .then(function() {
        //
      })
      .catch(function(err) {
        // console.log(err);
      });
  }
  setTimeout(function() {
    user
      .fetch()
      .then(function(user) {
        if ('password' in req.body) {
          //
        } else {
          return res.send({
            user: user,
            msg: 'Your profile information has been updated.'
          });
        }
        // res.redirect('/account');
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
        console.log(err);
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
  req.assert('password', 'Password must be at least 7 characters long').len(7);
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
                object_id: me
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
exports.singleUser_trophies = function(req, res, next) {
  const cur_u = req.query ? req.query.uid : 99999999;
  if (req.params && req.params.type == 'count') {
    new Trophy()
      .where({user_id: cur_u, reset_done: false})
      .fetchAll()
      .then(function(trophies) {
        trophies = trophies.toJSON();
        const counts = {
          gold: 0,
          silver: 0,
          bronze: 0,
          blue: 0
        };
        // console.log(trophies);
        for (let i = 0; i < trophies.length; i++) {
          counts[trophies[i].type]++;
        }
        return res.status(200).send({ok: true, counts: counts});
      })
      .catch(function(err) {
        // console.log(err);
        return res.status(200).send({
          ok: false,
          counts: {
            gold: 0,
            silver: 0,
            bronze: 0,
            blue: 0
          }
        });
      });
    return;
  }

  let a = new Trophy().where({user_id: cur_u, reset_done: false});
  if (req.query.type == 'ocg') {
    req.query.type = 'blue';
  }
  if (req.query.type) {
    a = a.where({
      type: req.query.type
    });
  }
  a.fetchAll({
    withRelated: ['tournament']
  })
    .then(function(trophies) {
      trophies = trophies.toJSON();
      return res.status(200).send({
        ok: true,
        items: trophies
      });
    })
    .catch(function(err) {
      return res.status(200).send({
        ok: false,
        items: []
      });
    });
};
exports.singleUser_info = function(req, res, next) {
  const cur_u = req.user ? req.user.id : 99999999;
  // console.log(cur_u);
  new User()
    .where(
      'username', 'ILIKE', req.query.uid
    )
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
      if (!req.user) {
        return;
      }
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
                res.redirect('/');
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
exports.xp_records = function(req, res, next) {
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
      let scr = new XP();
      scr = scr.where({
        user_id: user_id
      });

      scr
        .fetchAll({})
        .then(function(items) {
          res.status(200).send({ok: true, items: items.toJSON()});
        })
        .catch(function(err) {
          return res.status(400).send({ok: false, msg: 'Failed to fetch'});
        });
    });
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
        const season_obj = utils.get_current_season();
        const year = season_obj[0];
        const season = season_obj[1];

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

exports.deduct_money = function(req, res, next) {
  const amount = req.body.amount ? req.body.amount : 5;
  if (
    req.body.stripe_token == 'USE_OCG' ||
    req.body.stripe_token == 'USE_PAYPAL'
  ) {
    next();
  } else {
    let charge_amount = parseInt(((amount + 0.30) * 100 / 97 ) * 100);
    stripe.charges.create(
      {
        amount: charge_amount,
        currency: 'usd',
        source: req.body.stripe_token,
        description: 'Charge for Reset of  ' + req.body.duration
      },
      function(err, charge) {
        if (err) {
          // console.log(err);
          res.status(400).send({ok: false, msg: 'Failed to charge card'});
          return;
        }
        next();
      }
    );
  }
  // next();
};
exports.deduct_paypal = function(req, res, next) {
  if (req.body.stripe_token == 'USE_PAYPAL') {
    next();
    return;
    // return res
    //   .status(200)
    //   .send({ok: false, msg: 'failed to transact with paypal'});
    // const rnd = Math.random() * (10000000 - 1000000) + 1000000;
    //
    // paypal.pay(
    //   rnd,
    //   plan.cost,
    //   'Plan Buy ' + data.selected_plan,
    //   'USD',
    //   true,
    //   [req.user.id, 'action_here'],
    //   function(err, url) {
    //     if (err) {
    //       res.status(400).send({
    //         ok: false,
    //         msg: 'Failed to create payment'
    //       });
    //       return;
    //     }
    //     data.status = 'payment_pending';
    //     data.payment_id = rnd;
    //
    //     res.send({
    //       ok: true,
    //
    //       url_to_paypal: url,
    //       action: 'PAYMENT_PAYPAL'
    //     });
    //   }
    // );
  }
  next();
};
exports.deduct_ocg = function(req, res, next) {
  const amount = req.body.amount ? req.body.amount : 5;
  const action = req.body.action;
  let msg;
  switch (action) {
    case 'overallScore':
      msg = 'For resetting profile records';
      break;
    case 'score_life':
      msg = 'For resetting life records';
      break;
    case 'score_season':
      msg = 'For resetting season records';
      break;
    default:
      msg = 'For resetting profile records';
      break;
  }

  if (req.body.stripe_token == 'USE_OCG') {
    utils.takeCashFromUser(req.user.id, amount, msg, '');
  }
  next();
};

exports.resetScore = function(req, res, next) {
  const action = req.body.action;
  const season_obj = utils.get_current_season();
  const year = season_obj[0];
  const season = season_obj[1];
  let a;
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
          return res
            .status(400)
            .send({ok: false, msg: 'failed to reset score.'});
        });
      break;
    case 'score_life':
      a = new Score().where({
        user_id: req.user.id
      });
      if (req.body.only_for_ladder) {
        a = a.where({
          ladder_id: req.body.only_for_ladder
        });
      }
      a.destroy()
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
    case 'score_season':
      a = new Score().where({
        user_id: req.user.id,
        year: year,
        season: season
      });
      if (req.body.only_for_ladder) {
        a = a.where({
          ladder_id: req.body.only_for_ladder
        });
      }
      a.destroy()
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
    case 'BRONZE_TROPHIES':
      a = new Trophy().where({
        user_id: req.user.id,
        type: 'bronze'
      });

      a.save({reset_done: true}, {method: 'update'})
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
    case 'SILVER_TROPHIES':
      a = new Trophy().where({
        user_id: req.user.id,
        type: 'silver'
      });

      a.save({reset_done: true}, {method: 'update'})
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

exports.checkIfExists = function(req, res, next) {
  const new_username = req.body.new_username
    ? req.body.new_username
    : req.body.username;

  if (!new_username || new_username.length < 3) {
    return res.status(200).send({
      ok: false,
      msg: 'Username must be atleast 3 characters long'
    });
  }

  new User()
    .where('username', 'ILIKE', new_username)
    .fetch()
    .then(function(usr) {
      if (usr) {
        usr = usr.toJSON();
        if (!req.user) {
          return res.status(400).send({
            ok: false,
            msg: 'This username is already taken.'
          });
        }
        if (usr.id == req.user.id) {
          next();
        } else {
          return res.status(200).send({
            ok: false,
            msg:
              'This username is already being used. Please try any other username'
          });
        }
      } else {
        next();
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({
        ok: false,
        msg: 'Failed to update username.'
      });
    });
};
exports.changeUname = function(req, res, next) {
  req.assert('new_username', 'Username cannot be blank').notEmpty();
  // req.assert('new_username', 'Username cannot be blank').notEmpty();
  req
    .assert('new_username', 'Username must be atleast 3 characters long')
    .len(3);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  const user = new User({id: req.user.id});
  const new_username = req.body.new_username;
  user
    .save(
      {
        // email: req.body.email,
        username: new_username,
        pndng_uname_changes: 0
      },
      {patch: true}
    )
    .then(function() {
      return res.status(200).send({ok: true, msg: 'DONE'});
    })
    .catch(function(err) {
      return res.status(400).send({ok: false, msg: 'Failed'});
    });
};

exports.activateXPToken = function(req, res, next) {
  const current_token_count = req.user.double_xp_tokens;
  if (current_token_count < 1) {
    return res.status(400).send({
      ok: false,
      msg: 'You can not activate as you do not have a token.'
    });
  }
  if (req.user.double_xp) {
    return res.status(400).send({
      ok: false,
      msg: 'You can not activate as its already active.'
    });
  }
  new User()
    .where({
      id: req.user.id
    })
    .save(
      {
        double_xp_tokens: req.user.double_xp_tokens - 1,
        double_xp_obj: {starts_on: moment()},
        double_xp: true,
        double_xp_exp: moment().add(1, 'day')
      },
      {method: 'update'}
    )
    .then(function(usr) {
      return res.status(200).send({
        ok: true,
        action: 'PAYMENT_DONE',
        msg: 'Double XP is now active.'
      });
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({ok: false, msg: 'Failed to activate Double XP token.'});
    });
};
