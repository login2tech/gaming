const moment = require('moment');
// const Groups = require('./Groups');
const Message = require('./Message');
// const mailer = require('../../controllers/mailer');
// const Notification = require('../../models/Notification');

// const User = require('../../models/User');

exports.new = function(req, res, next) {
  if (!req.body.game_id || !req.body.msg) {
    return res.status(400).send({ok: false});
  }
  new Message()
    .save({
      from_id: req.user.id,
      game_id: req.body.game_id,
      msg: req.body.msg
    })
    .then(function(item) {
      return res.status(200).send({ok: true, chatItem: item.toJSON()});
    })
    .catch(function(err) {
      return res.status(400).send({ok: false});
    });
};

exports.list = function(req, res, next) {
  if (!req.query.game_id) {
    return res.status(200).send({ok: true, chats: []});
  }

  let a = new Message().where({
    // from_id: req.user.id,
    game_id: req.query.game_id
    // msg: req.body.msg
  });

  if (req.body.min_time) {
    a = a.where('created_at', '>=', req.body.min_time);
  } else {
    a = a.where('created_at', '>=', moment().subtract(5, 'seconds'));
  }

  a.fetchAll({
    withRelated: ['from']
  })
    .then(function(items) {
      return res
        .status(200)
        .send({ok: true, chats: items.toJSON(), fetched_on: moment()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({ok: false, chats: []});
    });
};
