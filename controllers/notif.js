const Notification = require('../models/Notification');

exports.list = function(req, res, next) {
  new Notification()
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(notifs) {
      if (!notifs) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, notifs: notifs.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.listMine = function(req, res, next) {
  new Notification()
    .where({
      user_id: req.user.id
    })
    .orderBy('id', 'DESC')
    .fetchAll()
    .then(function(notifs) {
      if (!notifs) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, notifs: notifs.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send([]);
    });
};

exports.delete = function(req, res, next) {
  const obj = {user_id: req.user.id};
  if (req.query.id) {
    obj.id = req.query.id;
  }
  new Notification()
    .where(obj)
    .destroy()
    .then(function(user) {
      if (req.query.id) {
        res.status(200).send({ok: true});
        return;
      }
      res.redirect('/notifications');
    })
    .catch(function(err) {
      if (req.query.id) {
        res.status(200).send({ok: true});
        return;
      }
      res.redirect('/notifications');
    });
};
