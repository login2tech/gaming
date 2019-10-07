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
    .then(function() {
      return res.status(200).send({ok: true});
    })
    .catch(function(err) {
      return res.status(400).send({ok: false});
    });
};
