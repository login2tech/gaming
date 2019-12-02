const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const credit_cost = 1;
const currency = 'usd';
const moment = require('moment');

const CashTransactions = require('../models/CashTransactions');
const CreditTransactions = require('../models/CreditTransactions');
const WithdrawalRequest = require('../models/Withdrawal');

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

// const __removeCredit_points = function(points, user_id, descr, cb) {
//   new User({id: user_id}).fetch().then(function(user) {
//     const prev_points = user.get('credit_balance');
//     const new_points = prev_points - points;
//     user
//       .save({
//         credit_balance: new_points
//       })
//       .then(function(new_user) {
//         cb(true);
//         // __addNewCreditPointTransaction(user_id, descr, points);
//       })
//       .catch(function(err) {
//         cb(false);
//       });
//   });
// };

const stripe_afterCustomerCreation = function(customer, req, res) {
  let plan;
  const sub_type = req.body.init_transaction_mode;
  let bill_type;
  if (req.body.init_transaction_mode == 'prime') {
    plan = 'prime-monthly';
    bill_type = 'Prime Membership';
  } else {
    plan = 'double-xp-monthly';
    bill_type = 'Double XP';
  }

  stripe.subscriptions.create(
    {
      customer: customer.id,
      plan: plan,
      quantity: 1
    },
    function(err, subscription) {
      if (err) {
        console.log(err);
        return res
          .status(200)
          .send({ok: false, msg: 'Failed to start subscription.'});
      }
      // console.log('---------');
      // console.log(subscription);
      // console.log('---------');
      // console.log(subscription.items.data);
      // console.log('---------');
      const subs_obj = {
        subscription_id: subscription.id,
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        start: subscription.start,
        status: subscription.status,
        customer: subscription.customer,
        quantity: subscription.quantity,
        plan_id: subscription.plan.id,
        trial_end: subscription.trial_end
      };
      // console.log(subs_obj);
      User.forge({id: req.user.id})
        .fetch()
        .then(function(usr) {
          if (!usr) {
            return res.status(400).send({ok: false, msg: 'Some Error #60'});
          }
          usr
            .save(
              {
                [sub_type + '_obj']: subs_obj,
                [sub_type]: true,
                stripe_user_id: customer.id
              },
              {patch: true}
            )
            .then(function() {
              res.status(200).send({
                ok: true,
                action: 'PAYMENT_DONE',
                msg:
                  'Your subscription was successful. You are being billed for ' +
                  bill_type +
                  '.'
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
};

const getStripeCustomer = function(req, res) {
  // const stripeTokenObj = req.body.stripe_token;
  const stripeToken = req.body.stripe_token;

  if (req.user.stripe_user_id) {
    const stripe_customer_id = req.user.stripe_user_id;
    stripe.customers.retrieve(stripe_customer_id, function(err, customer) {
      if (err) {
        res.status(400).send({ok: false, msg: 'Some error #127'});
        return;
      }
      stripe.customers.createSource(
        customer.id,
        {
          source: stripeToken
        },
        function(err, card) {
          if (err) {
            res.status(400).send({
              ok: false,
              msg:
                'Unable to use this card for payment, please use another card.'
            });
            return;
          }
          // card attached, lets make it default one.
          stripe.customers.update(
            customer.id,
            {
              default_source: card.id
            },
            function(err, customer) {
              if (err) {
                res.status(400).send({
                  ok: false,
                  msg:
                    'Unable to use this card as a default payment method, please use another card.'
                });
                return;
              }
              // all done, proceed with subscription.
              return stripe_afterCustomerCreation(customer, req, res);
            }
          );
        }
      );
    });
  } else {
    // create a customer
    stripe.customers.create(
      {
        description: 'Created for OCG',
        email: req.user.email,
        source: stripeToken
      },
      function(err, customer) {
        if (err) {
          return res.status(400).send({
            ok: false,
            msg: 'We were unable to create a subscription for you. ERR #143'
          });
        }

        return stripe_afterCustomerCreation(customer, req, res);
      }
    );
  }
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
                double_xp_exp: moment().add(1, 'month')
              },
              {patch: true}
            )
            .then(function() {
              res.status(200).send({
                ok: true,
                action: 'PAYMENT_DONE',
                msg:
                  'Successfully charged card to activate double xp for 1 month'
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

  if (
    // req.body.init_transaction_mode == 'double_xp' ||
    req.body.init_transaction_mode == 'prime'
  ) {
    // start subscription here
    getStripeCustomer(req, res);

    // .then(function(customer_id){
    //
    // })
    //
    return;
  }
  stripe.charges
    .create({
      amount: cost_to_consume * 100,
      currency: currency,
      description: 'Charge for adding ' + req.body.points_to_add + ' points',
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
exports.new = newCredits;
exports.withdraw = withdraw;

exports.stopRenewal = function(req, res, next) {
  req.assert('type', 'Type cannot be blank').notEmpty();

  const type = req.body.type;

  new User({id: req.user.id}).fetch().then(function(usr) {
    if (usr.get(type)) {
      let obj = usr.get(type + '_obj');
      console.log(obj);
      if (obj && obj != '{}') {
        obj = JSON.parse(obj);
        const id = obj.subscription_id;
        stripe.subscriptions.update(id, {cancel_at_period_end: true}, function(
          err,
          subscription
        ) {
          if (err) {
            return res
              .status(400)
              .send({ok: false, msg: 'failed to cancel subscription.'});
          }
          obj.ending_on_period_end = true;
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
        });
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
