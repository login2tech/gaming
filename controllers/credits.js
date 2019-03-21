const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const credit_cost = 1;
const currency = 'usd';

const __addNewCreditPointTransaction = function(user_id, payment_id, points) {};

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
        __addNewCreditPointTransaction(user_id, payment_id, points);
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
            .save({
              [sub_type + '_obj']: subs_obj,
              [sub_type]: true,
              stripe_user_id: customer.id
            })
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

const newCredits = function(req, res, next) {
  req.assert('stripe_token', 'Card Token cannot be blank').notEmpty();

  req
    .assert('points_to_add', 'Please specify the credit points to add.')
    .notEmpty();
  // console.log('absdfsd');
  const cost_to_consume = req.body.points_to_add * credit_cost;

  if (
    req.body.init_transaction_mode == 'double_xp' ||
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
