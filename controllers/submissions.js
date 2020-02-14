const Submission = require('../models/Submission');
const Invoice = require('../models/Invoice');
const Plan = require('../models/Plan');
const Vote = require('../models/Vote');
const Notification = require('../models/Notification');
// const User = require('../models/User');
const mailer = require('./mailer');

const stripe = require('stripe')(process.env.STRIPE_KEY);
const doMailNewBan = function(submission) {
  const sub = submission;
  // const user = sub.user;
  const em = sub.user.email;
  if (!em) {
    return;
  }
  mailer.doMail(
    em,
    false,
    false,
    'New Report',
    'Hi,<br /><br />Your submission with id ' +
      submission.id +
      ' has just been banned by admin as it violates the terms of use or has been reported a large number of times.<br /><br />Regards'
  );
};
const doMailNewReport = function(submission, user) {
  const em = process.env.ADMIN_EMAIL;
  if (!em) {
    return;
  }
  mailer.doMail(
    em,
    false,
    false,
    'New Report',
    'Hi Admin,<br /><br />A submission with ID ' +
      submission.id +
      ' has just been reported by a user named ' +
      user.first_name +
      ' ' +
      user.last_name +
      ' userid: (#' +
      user.id +
      ')<br /><br />Login to admin dashboard if you feel this submission needs to be banned.<br /><br />Regards'
  );
};

const doNewSubMail = function(submission, user, data) {
  if (mailer.status == 'publish') {
    mailer.doMail(
      user.email,
      false,
      false,
      'New Submission',
      'Hi ' +
        user.first_name +
        ',<br /><br />Your new submission is published and we will present you with results as soon as people start voting. Login to your dashboard to check the status of your submissions.<br /><br />Regards'
    );
  } else {
    mailer.doMail(
      user.email,
      false,
      false,
      'New Submission',
      'Hi ' +
        user.first_name +
        ',<br /><br />Your new submission is saved and will be available for voting once you complete voting on other submissions. Login to your dashboard to check the status of your submissions.<br /><br />Regards'
    );
  }
};

const checkIfCanBePublished = function(sub, user, data) {
  new Vote()
    .where({user_id: user.id})
    .count()
    .then(function(count) {
      if (count < 1) {
        return;
      }
      console.log('user has done ', count, ' votes');
      new Submission()
        .where({user_id: user.id})
        .count()
        .then(function(submission_count) {
          const consumed_votes = submission_count * 30;
          let obj;
          console.log('user has done ', submission_count, ' submissions');
          if (count > consumed_votes) {
            obj.pending_pre_votes = 30 - (count - consumed_votes);
            // chnage the pre count status
            if (count - consumed_votes >= 30) {
              // change teh status as well.
              obj.status = 'publish';
            }
            sub.save(obj);
          } else {
            // votes are not for consumed as well no chance for new.
          }
        });
    });
};

const __newInvoice = function(charge, uid, sid) {
  const inv = new Invoice({
    charge_id: charge.id,
    user_id: uid,
    amount: charge.amount / 100,
    created: charge.created,
    currency: charge.created,
    paid: charge.paid,
    receipt_url: charge.receipt_url,
    status: charge.status,
    source: charge.source.id,
    submission_id: sid
  }).save();
  return inv;
};

const __newSubmission = function(data, user) {
  const submission = new Submission({
    part_of_body: data.part_of_body,
    gender: data.gender,
    age_group: data.age_group,
    image_url: data.image_path,
    description: data.description,
    status: data.status,
    payment_id: data.payment_id,
    user_id: user.id,
    mature: data.mature,
    selected_plan: 'FREE',
    total_votes: data.jury_size,
    votes_done: 0,
    pending_pre_votes: data.pending_pre_votes,
    settings: {
      jury_age: data.jury_age,
      jury_size: data.jury_size,
      jury_kind: data.jury_kind
    }
  }).save();
  return submission;
};

const __fetchPlan = function(plan_id) {
  return new Promise(function(resolve, reject) {
    new Plan()
      .where({id: plan_id})
      .fetch()
      .then(function(plan) {
        if (plan) {
          resolve(plan.toJSON());
        } else {
          reject('Plan not found');
        }
      });
  });
};

const __myProgressAdd = function(uid) {
  new Submission()
    .where({
      user_id: uid,
      status: 'draft'
    })
    .orderBy('id', 'desc')
    .fetch()
    .then(function(data) {
      if (data) {
        const pending_pre_votes = data.get('pending_pre_votes');
        pending_pre_votes--;
        const new_obj = {pending_pre_votes: pending_pre_votes};
        if (pending_pre_votes == 0) {
          new_obj.status = 'publish';
        }
        data
          .save(new_obj)
          .then(function(data) {})
          .catch(function() {});
      }
    })
    .catch(function() {});
};

const __fetchRandom = function(allow_mature, uid) {
  return new Promise(function(resolve, reject) {
    Submission.query(function(qb) {
      qb.select();
      qb.where({status: 'publish'});
      if (!allow_mature) {
        qb.where({mature: false});
      }
      qb.whereNot({user_id: uid});
      qb.orderByRaw('random()');
      qb.limit(10);
    })
      .fetchAll({withRelated: ['votes']})
      .then(function(data) {
        if (data) {
          resolve(data.toJSON());
        } else {
          // console.log('empty');
          reject([]);
        }
      })
      .catch(function(err) {
        // console.log(err);
        reject([]);
      });
  });
};

exports.newSubmission = function(req, res, next) {
  const data = req.body;
  const user = req.user;
  if (data.mode == 'free') {
    //
    data.payment_id = '';
    data.jury_age = '';
    data.status = 'draft';
    data.jury_size = 30;
    data.jury_kind = '';
    data.pending_pre_votes = 0; // todo

    __newSubmission(data, user)
      .then(function(sub) {
        res
          .status(200)
          .send({ok: true, msg: 'Created Submission', action: 'PAYMENT_DONE'});
        doNewSubMail(sub, user, data);
        checkIfCanBePublished(sub, user, data);
      })
      .catch(function() {
        req.status(400).send({ok: false, msg: 'Failed to create submission'});
      });
  } else {
    __fetchPlan(req.body.plan_id)
      .then(function(plan) {
        //
        data.selected_plan = plan.plan_name;
        data.jury_size = plan.jury_count;

        stripe.charges
          .create({
            amount: plan.cost * 100 + plan.cost * 3,
            currency: 'usd',
            description: 'Charge for Submission for plan ' + plan.plan_name,
            source: data.stripe_token
          })
          .then(function(stripe_data) {
            //
            data.payment_id = stripe_data.id;
            data.status = 'publish';

            __newSubmission(data, user)
              .then(function(newSub) {
                res.status(200).send({
                  ok: true,
                  msg: 'Created Submission',
                  action: 'PAYMENT_DONE'
                });
                __newInvoice(stripe_data, req.user.id, newSub.id);
                doNewSubMail(newSub, user, data);
              })
              .catch(function() {
                req.status(400).send({
                  ok: false,
                  msg:
                    'Failed to create submission. Contact Support if payment has been deducted.'
                });
                __newInvoice(stripe_data, req.user.id, null);
              });
          })
          .catch(function() {
            req
              .status(400)
              .send({ok: false, msg: 'Failed to Charge the card.'});
          });
      })
      .catch(function() {
        req.status(400).send({ok: false, msg: 'Unknown Plan'});
      });
  }
};

exports.submissionBan = function(req, res, next) {
  req.assert('id', 'Submission Id not found').notEmpty();
  const errors = req.validationErrors();
  res.status(200).send({ok: true});
  if (errors) {
    return res.status(400).send(errors);
  }
  new Submission()
    .where({
      id: req.body.id
    })
    .fetch()
    .then(function(item) {
      if (!item) {
        return;
      }
      // const rc = item.get('report_count') + 1;
      // const obj = {
      //   report_count: rc
      // };
      item.save({status: 'ban'});

      doMailNewBan(item.toJSON());
      // new Notification({
      //   description:
      //     req.user.first_name +
      //     ' ' +
      //     req.user.last_name +
      //     '(#' +
      //     req.user.id +
      //     ') reported the submission id ' +
      //     item.id,
      //   user_id: req.user.id,
      //   type: 'REPORT',
      //   object_id: item.id
      // }).save();
    })
    .catch(function(err) {
      console.log(err);
    });
};

exports.report = function(req, res, next) {
  req.assert('item_id', 'Submission Id not found').notEmpty();
  const errors = req.validationErrors();
  res.status(200).send({ok: true});
  if (errors) {
    return res.status(400).send(errors);
  }

  new Submission()
    .where({
      id: req.body.item_id
    })
    .fetch()
    .then(function(item) {
      if (!item) {
        return;
      }
      const rc = item.get('report_count') + 1;
      const obj = {
        report_count: rc
      };
      item.save(obj);

      doMailNewReport(item.toJSON(), req.user);
      new Notification({
        description:
          req.user.first_name +
          ' ' +
          req.user.last_name +
          '(#' +
          req.user.id +
          ') reported the submission id ' +
          item.id,
        user_id: req.user.id,
        type: 'REPORT',
        object_id: item.id
      }).save();
    })
    .catch(function(err) {
      console.log(err);
    });
};

exports.randomSubmission = function(req, res, next) {
  let allow_mature = req.query.allow_mature
    ? parseInt(req.query.allow_mature)
    : 0;
  allow_mature = allow_mature ? true : false;
  __fetchRandom(allow_mature, req.user.id)
    .then(function(data) {
      res.status(200).send({
        ok: data.length ? true : false,
        item: data.length ? data[0] : {}
      });
    })
    .catch(function(data) {
      res.status(400).send({
        ok: false,
        msg: 'failed to fetch data',
        item: {}
      });
    });
};

exports.newVote = function(req, res, next) {
  req.assert('vote', 'You need to vote first').notEmpty();
  req.assert('item_id', 'Submission Id not found').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new Submission()
    .where({
      id: req.body.item_id
    })
    .fetch()
    .then(function(item) {
      if (item) {
        new Vote({
          submission_id: req.body.item_id,
          vote: req.body.vote == 'yes' ? 1 : 0,
          user_id: req.user.id
        })
          .save()
          .then(function() {
            let votes_done = item.get('votes_done');
            const total_votes = item.get('total_votes');
            votes_done++;
            const new_obj = {
              votes_done: votes_done
            };
            if (total_votes == votes_done) {
              new_obj.status = 'complete';
            }
            res.status(200).send({
              ok: true,
              msg: 'Vote Updated'
            });
            item.save(new_obj);
            __myProgressAdd(req.user.id);
          })
          .catch(function(err) {
            // console.log(err);
            res.status(400).send({
              ok: false,
              msg: 'failed to update db'
            });
          });
      } else {
        res.status(400).send({
          ok: false,
          msg: 'failed to fetch'
        });
      }
    })
    .catch(function() {
      res.status(400).send({
        ok: false,
        msg: 'failed to fetch'
      });
    });
};

exports.my = function(req, res, next) {
  new Submission()
    .where({user_id: req.user.id})
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(submissions) {
      if (!submissions) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({
        ok: true,
        items: submissions.toJSON()
      });
    })
    .catch(function(err) {
      return res.status(200).send({ok: true, items: []});
    });
};

exports.myVotes = function(req, res, next) {
  new Vote()
    .where({submission_id: req.body.sub_id, user_id: req.user.id})
    .orderBy('id', 'DESC')
    .fetchAll({
      withRelated: [
        {
          user: function(qb) {
            qb.column('age', 'gender', 'first_name', 'last_name');
          }
        }
      ]
    })
    .then(function(submissions) {
      if (!submissions) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({
        ok: true,
        items: submissions.toJSON()
      });
    })
    .catch(function(err) {
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listSubmissions = function(req, res, next) {
  new Submission()
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['user']})
    .then(function(submissions) {
      if (!submissions) {
        return res.status(200).send([]);
      }
      return res.status(200).send(submissions.toJSON());
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.listSubmissionVotes = function(req, res, next) {
  new Vote()
    .where({submission_id: req.params.id})
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['user']})
    .then(function(botes) {
      if (!botes) {
        return res.status(200).send([]);
      }
      return res.status(200).send(botes.toJSON());
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

const invo = function(data, cb) {
  let i = new Invoice();

  if (data.user_id) {
    i = i.where({
      user_id: data.user_id
    });
  }
  i.fetchAll({withRelated: ['user']})
    .then(function(data) {
      if (data) {
        // console.log(data);
        cb(false, data.toJSON());
      } else {
        cb('No invoices Found');
      }
    })
    .catch(function(err) {
      // console.log(err);
      cb('Failed to fetch', {});
    });
};

exports.allInvoices = function(req, res, next) {
  invo({}, function(err, data) {
    if (err) {
      res.status(400).send({ok: false, data: [], msg: err});
      return;
    }
    res.status(200).send({ok: true, items: data});
  });
};

exports.allInvoicesOf = function(req, res, next) {
  invo({user_id: req.params.id}, function(err, data) {
    if (err) {
      res.status(400).send({ok: false, data: [], msg: err});
    }
    res.status(200).send({ok: true, items: data.data});
  });
};
