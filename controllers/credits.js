const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const credit_cost = 1;
const currency = 'usd';
const moment = require('moment');
const utils = require('../routes/utils');
const CashTransactions = require('../models/CashTransactions');
const CreditTransactions = require('../models/CreditTransactions');
const WithdrawalRequest = require('../models/Withdrawal');
const Notif = require('../models/Notification');

const plan_costs = {
  gold: 6.99,
  silver: 4.99
};
// TODO: Change plan ids for production. not using env vars here.
const stripe_plans = {
  gold: 'prime-monthly',
  silver: 'prime-monthly'
};
const getDoubleXPAmount = function() {
  return 5;
};

const __addNewCreditPointTransaction = function(
  user_id,
  payment_id,
  points,
  init_transaction_mode
) {
  if (init_transaction_mode == 'credit') {
    new CreditTransactions()
      .save({
        user_id: user_id,
        obj_type: 'shop',
        details: 'Credits bought.',
        qty: points
      })
      .then(function(o) {})
      .catch(function(err) {
        console.log(8, err);
      });
  } else {
    new CashTransactions()
      .save({
        user_id: user_id,
        obj_type: 'shop',
        details: 'OCG Cash bought.',
        qty: points
      })
      .then(function(o) {})
      .catch(function(err) {
        console.log(8, err);
      });
  }
};

const withdraw = function(req, res, next) {
  if (
    !req.body.amount_to_withdraw ||
    !req.body.withdraw_method ||
    !req.body.withdraw_path
  ) {
    return res
      .status(400)
      .send({ok: false, msg: 'Not all values were provided.'});
  }
  // console.log(parseFloat(req.user.cash_balance));
  // console.log(parseFloat(req.body.amount_to_withdraw));
  if (
    parseFloat(req.user.cash_balance) < parseFloat(req.body.amount_to_withdraw)
  ) {
    return res
      .status(400)
      .send({ok: false, msg: 'You dont have sufficient balance'});
  }

  new User()
    .where({id: req.user.id})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get('cash_balance');
        // console.log(cash_balance);
        cash_balance -= parseInt(req.body.amount_to_withdraw);
        // console.log(cash_balance);
        usr
          .save({cash_balance: cash_balance}, {patch: true})
          .then(function(usr) {
            new CashTransactions()
              .save({
                user_id: req.user.id,
                details: 'Cash Debit for withdrawal',
                qty: -parseFloat(req.body.amount_to_withdraw)
              })
              .then(function(o) {})
              .catch(function(err) {
                console.log(4, err);
              });

            new WithdrawalRequest()
              .save({
                user_id: req.user.id,
                method: req.body.withdraw_method,
                path: req.body.withdraw_path,
                amount: req.body.amount_to_withdraw,
                status: 'pending'
              })
              .then(function(o) {
                return res.status(200).send({
                  ok: true,
                  msg:
                    'Withdrawal Request Created. You will receive funds shortly.'
                });
              })
              .catch(function(err) {
                console.log(5, err);
                return res
                  .status(400)
                  .send({ok: true, msg: 'Failed to create '});
              });
          })
          .catch(function(err) {
            console.log(141, err);
            return res.status(400).send({ok: true, msg: 'Failed to create '});
          });
      }
    })
    .catch(function(err) {
      console.log(11, err);
    });
};

const transfer = function(req, res, next) {
  if (!req.body.amount_to_transfer || !req.body.username_to_transfer) {
    return res
      .status(400)
      .send({ok: false, msg: 'Not all values were provided.'});
  }
  if (
    req.user.username.toLowerCase() ==
    req.body.username_to_transfer.toLowerCase()
  ) {
    return res
      .status(400)
      .send({ok: false, msg: 'Self transfer is not allowed.'});
  }
  new User()
    .where('username', 'ILIKE', req.body.username_to_transfer)
    .fetch()
    .then(function(u) {
      if (!u) {
        res.status(400).send({
          ok: false,
          msg: 'No Such Username'
        });
        return;
      }
      //
      utils.takeCreditsFromUser(
        req.user.id,
        req.body.amount_to_transfer,
        'Transferred to @' + req.body.username_to_transfer,
        ''
      );
      utils.giveCreditsToUser(
        u.get('id'),
        req.body.amount_to_transfer,
        'Received from @' + req.user.username,
        ''
      );
      new Notif()
        .save({
          user_id: u.get('id'),
          description:
            '@' +
            req.user.username +
            ' has transferred you ' +
            req.body.amount_to_transfer +
            ' credits',
          type: 'credits',
          object_id: 1
        })
        .then(function() {})
        .catch(function(er) {
          console.log(er);
        });
      res.status(200).send({ok: true, msg: 'Transferred Successfully.'});
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).status({
        ok: false,
        msg: 'Failed to transfer credits to another user.'
      });
    });
};

const __addNewCredit_points = function(
  init_transaction_mode,
  points,
  user_id,
  payment_id,
  cb
) {
  const type =
    init_transaction_mode == 'credit' ? 'credit_balance' : 'cash_balance';
  // console.log(type);
  new User({id: user_id}).fetch().then(function(user) {
    const prev_points = user.get(type);
    const new_points = parseInt(prev_points) + parseInt(points);
    user
      .save(
        {
          [type]: new_points
        },
        {patch: true}
      )
      .then(function(new_user) {
        cb(true);
        __addNewCreditPointTransaction(
          user_id,
          payment_id,
          points,
          init_transaction_mode
        );
      })
      .catch(function(err) {
        cb(false);
      });
  });
};

const proceedWithDoubleXP = function(req, res) {
  const stripeToken = req.body.stripe_token;

  stripe.charges.create(
    {
      amount: getDoubleXPAmount() * 100,
      currency: 'usd',
      source: stripeToken,
      description: 'Charge for double xp for ' + req.user.email
    },
    function(err, charge) {
      if (err) {
        console.log(err);
        res.status(400).send({ok: false, msg: 'failed to charge card'});
        return;
      }

      User.forge({id: req.user.id})
        .fetch()
        .then(function(usr) {
          if (!usr) {
            return res.status(400).send({ok: false, msg: 'Some Error #355'});
          }
          usr
            .save(
              {
                double_xp_obj: {starts_on: moment()},
                double_xp: true,
                double_xp_exp: moment().add(1, 'day')
              },
              {patch: true}
            )
            .then(function(usr) {
              res.status(200).send({
                ok: true,
                action: 'PAYMENT_DONE',
                user: usr.toJSON(),
                msg: 'Successfully charged card to activate double xp for 1 day'
              });
            })
            .catch(function(err) {
              return res.status(400).send({ok: false, msg: 'Some Error #355'});
            });
        })
        .catch(function(err) {
          return res.status(400).send({ok: false, msg: 'Some Error #355'});
        });
    }
  );
};

const newCredits = function(req, res, next) {
  req.assert('stripe_token', 'Card Token cannot be blank').notEmpty();

  req
    .assert('points_to_add', 'Please specify the credit points to add.')
    .notEmpty();

  const cost_to_consume = req.body.points_to_add * credit_cost;

  if (req.body.init_transaction_mode == 'double_xp') {
    proceedWithDoubleXP(req, res);
    return;
  }

  const term_to_use =
    req.body.init_transaction_mode == 'credit' ? 'credits' : 'OCG Cash';
  stripe.charges
    .create({
      amount: cost_to_consume * 100,
      currency: currency,
      description:
        'Charge for adding ' + req.body.points_to_add + ' ' + term_to_use,
      source: req.body.stripe_token
    })
    .then(function(stripe_data) {
      const term =
        req.body.init_transaction_mode == 'credit' ? 'credits' : 'cash';

      // console.log('aehwehw');
      if (stripe_data.id) {
        __addNewCredit_points(
          req.body.init_transaction_mode,
          req.body.points_to_add,
          req.user.id,
          stripe_data.id,
          function(resp) {
            if (resp) {
              res.status(200).send({
                ok: true,
                action: 'PAYMENT_DONE',
                msg: 'Successfully Added ' + term + ' to your account'
              });
            } else {
              res.status(200).send({
                ok: true,
                msg: 'Payment Successfull. Failed to ' + term + '.'
              });
            }
          }
        );
      } else {
        // console.log(stripe_data);
        // console.log('rhwhe');
        res.status(400).send({
          ok: true,
          msg: 'Unable to charge the card for payment'
        });
      }
    })
    .catch(function(err) {
      res.status(400).send({
        ok: true,
        msg: 'Some error occoured'
      });
    });
};

exports.stopRenewal = function(req, res, next) {
  req.assert('type', 'Type cannot be blank').notEmpty();

  const type = req.body.type;

  new User({id: req.user.id}).fetch().then(function(usr) {
    if (usr.get(type)) {
      let obj = usr.get(type + '_obj');
      if (obj && obj != '{}') {
        obj = JSON.parse(obj);
        if (obj.bought_type == 'Stripe') {
          const id = obj.subscription_id;
          stripe.subscriptions.update(
            id,
            {cancel_at_period_end: true},
            function(err, subscription) {
              if (err) {
                return res
                  .status(400)
                  .send({ok: false, msg: 'failed to cancel subscription.'});
              }
              obj.ending_on_period_end = true;
              obj.cancel_requested = true;
              obj.stops_on = obj.next_renew;
              usr
                .save(
                  {
                    [type + '_obj']: JSON.stringify(obj)
                  },
                  {patch: true}
                )
                .then(function(u) {
                  return res.status(200).send({
                    ok: true,
                    msg: 'Subscription will stop at period end',
                    user: u.toJSON()
                  });
                })
                .catch(function(err) {
                  return res
                    .status(400)
                    .send({ok: false, msg: 'Failed to cancel subscription.'});
                });
            }
          );
        } else {
          // OCG WALA HAI YE!
        }
      } else {
        return res
          .status(400)
          .send({ok: false, msg: 'Failed to Cancel subscription.'});
      }
    } else {
      return res
        .status(400)
        .send({ok: false, msg: 'subscription is not active.'});
    }
  });
};

const create_new_user_for_token = function(req, res, next) {
  const stripeToken = req.body.stripe_token;
  stripe.customers.create(
    {
      description: 'Created for OnlyCompGaming',
      email: req.user.email,
      source: stripeToken
    },
    function(err, customer) {
      if (err || !customer.id) {
        return res.status(400).send({
          ok: false,
          msg: 'We were unable to create a subscription for you. ERR #550'
        });
      }
      console.log(customer);
      // use the customer id created
      req.use_customer_id = customer.id;
      req.next();
    }
  );
};

const link_token_to_user = function(req, res, next) {
  const stripeToken = req.body.stripe_token;
  const stripe_customer_id = req.user.stripe_user_id;
  stripe.customers.retrieve(stripe_customer_id, function(err, customer) {
    if (err) {
      console.log(err);
      // failed to retreive customer, lets create a new one.
      return create_new_user_for_token(req, res, next);
    }
    stripe.customers.createSource(
      customer.id,
      {
        source: stripeToken
      },
      function(err, card) {
        if (err) {
          console.log(err);
          return res.status(400).send({
            ok: false,
            msg: 'Unable to use this card for payment, please use another card.'
          });
        }
        // card attached, lets make it default one.
        stripe.customers.update(
          customer.id,
          {
            default_source: card.id
          },
          function(err, customer) {
            if (err || !customer.id) {
              console.log(err);
              return res.status(400).send({
                ok: false,
                msg:
                  'Unable to use this card as a default payment method, please use another card.'
              });
            }
            // use the customer id retreived
            req.use_customer_id = customer.id;
            // all done, proceed with subscription.
            next();
          }
        );
      }
    );
  });
};

exports.resolveCustomerId = function(req, res, next) {
  //
  const stripe_token = req.body.stripe_token;
  if (stripe_token == 'USE_OCG') {
    // no need to resolve customer id as not using stripe
    next();
  } else if (req.user.stripe_user_id) {
    console.log('stripe id exists');
    // customer id already linked, shall i attach a new credit card source?
    link_token_to_user(req, res, next, stripe_token);
  } else {
    console.log('stripe id is being created');
    // no customer id, create 1 and link it and proceed
    create_new_user_for_token(req, res, next);
  }
  //
};
const addMembershipLog = function(plan, action) {
  //
  // TODO: do this
};
exports.buyMembership = function(req, res, next) {
  const stripe_token = req.body.stripe_token;
  const plan = req.body.plan;
  if (stripe_token == 'USE_OCG') {
    // add membership but with manual details for cron.
    const cash_to_consume = plan_costs[plan];
    if (parseFloat(req.user.cash_balance) < cash_to_consume) {
      return res.status(500).send({
        ok: false,
        msg: 'You do not have sufficient OCG Cash to perform this action.'
      });
    }
    utils.takeCashFromUser(
      req.user.id,
      cash_to_consume,
      'Buying OCG ' + plan + ' Membership',
      ''
    );
    let double_xp_tokens_to_buy = 0;
    let pndng_uname_changes = req.user.pndng_uname_changes;
    if (plan.toLowerCase() == 'gold') {
      utils.giveCreditsToUser(
        req.user.id,
        10,
        'Free Credit on purchase of  ' + plan + ' Membership',
        ''
      );
      double_xp_tokens_to_buy = req.user.double_xp_tokens + 3;
      pndng_uname_changes++;
    } else {
      double_xp_tokens_to_buy = req.user.double_xp_tokens + 1;
    }
    const user_obj_to_save = {
      prime: true,
      prime_obj: JSON.stringify({
        cancel_requested: false,
        bought_type: 'OCG',
        double_xp_tokens: double_xp_tokens_to_buy,
        pndng_uname_changes: pndng_uname_changes,
        check_for_cron: true,
        check_for_hook: false,
        prime_type: plan,
        starts_on: moment(),
        next_renew: moment().add(1, 'month')
      }),
      prime_type: plan,
      prime_exp: moment().add(1, 'month')
    };
    new User()
      .where({id: req.user.id})
      .save(user_obj_to_save, {
        method: 'update'
      })
      .then(function(user) {
        addMembershipLog(plan, 'add');
        console.log(user.toJSON());
        return res.status(200).send({
          ok: true,
          msg: 'Membership successfully Started',
          user: user.toJSON()
        });
      })
      .catch(function(err) {
        console.log(err);
        return res.status(400).send({
          ok: false,
          msg:
            'Failed to Charge account with OCG Cash for new membership. Please try again later or contact site admin.'
        });
      });
  } else {
    const use_customer_id = req.use_customer_id;
    const user_obj_to_save = {
      stripe_user_id: use_customer_id,
      prime: true,
      prime_obj: {
        cancel_requested: false,
        bought_type: 'Stripe',
        check_for_cron: false,
        check_for_hook: true,
        prime_type: plan,
        starts_on: moment(),
        next_renew: moment().add(1, 'month')
      },
      prime_type: plan,
      prime_exp: moment().add(1, 'month')
    };
    const stripe_plan = stripe_plans[plan];
    // bill_type = 'Prime Membership';
    // console.log(use_customer_id);

    stripe.subscriptions.create(
      {
        customer: use_customer_id,
        plan: stripe_plan,
        quantity: 1
      },
      function(err, subscription) {
        if (err) {
          console.log(err);
          return res.status(200).send({
            ok: false,
            msg: 'Failed to start subscription. Please contact site admin'
          });
        }

        if (plan.toLowerCase() == 'gold') {
          utils.giveCreditsToUser(
            req.user.id,
            10,
            'Free Credit on purchase of  ' + plan + ' Membership',
            ''
          );
          user_obj_to_save.pndng_uname_changes =
            req.user.pndng_uname_changes + 1;
          user_obj_to_save.double_xp_tokens = req.user.double_xp_tokens + 3;
        } else {
          user_obj_to_save.double_xp_tokens = req.user.double_xp_tokens + 1;
        }

        user_obj_to_save.prime_obj.subscription_id = subscription.id;

        User.forge({id: req.user.id})
          .fetch()
          .then(function(usr) {
            if (!usr) {
              return res.status(400).send({ok: false, msg: 'Some Error #60'});
            }
            usr
              .save(user_obj_to_save, {patch: true})
              .then(function(user) {
                res.status(200).send({
                  ok: true,
                  action: 'PAYMENT_DONE',
                  user: user.toJSON(),
                  msg:
                    'Your subscription was successful. You are being billed for ' +
                    plan +
                    ' membership.'
                });
                // const group_obj = {
                //   // group_name: grp.get('name'),
                //   // user_name: user_first_name,
                //   plan_name: 'Standard - ' + req.body.billing_type,
                //   group_cname: grp.get('cname'),
                //   email: req.user.email,
                //   billed_amount: '000',
                //   link_to_invoice: ''
                // };
                // Emails.upgradeGroup(group_obj);
              })
              .catch(function(err) {
                // Raven.captureException(err);
                res.status(400).send({
                  ok: false,
                  msg:
                    'Subscription Created! ERROR fetching data, please contact support. ERR#54'
                });
              });
          })
          .catch(function(err) {
            // Raven.captureException(err);
            res.status(400).send({
              ok: false,
              msg:
                'Subscription Created! ERROR fetching data, please contact support. ERR#148'
            });
          });
      }
    );

    // start subscription
  }

  //
};

exports.new = newCredits;
exports.withdraw = withdraw;
exports.transfer = transfer;
