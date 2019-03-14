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
  // console.log('jsdjgwreke');
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

const newCredits = function(req, res, next) {
  req.assert('stripe_token', 'Card Token cannot be blank').notEmpty();

  req
    .assert('points_to_add', 'Please specify the credit points to add.')
    .notEmpty();
  // console.log('absdfsd');
  const cost_to_consume = req.body.points_to_add * credit_cost;
  stripe.charges
    .create({
      amount: cost_to_consume * 100,
      currency: currency,
      description: 'Charge for adding ' + req.body.points_to_add + ' points',
      source: req.body.stripe_token
    })
    .then(function(stripe_data) {
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
                msg: 'Successfully Added Credits to your account'
              });
            } else {
              res.status(200).send({
                ok: true,
                msg: 'Payment Successfull. Failed to credit.'
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
