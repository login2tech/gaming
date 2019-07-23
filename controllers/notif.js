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
  new Notification()

    .where({
      user_id : req.user.id
    })
    .destroy()
    .then(function(user) {
      // res.send({msg: ''});
      res.redirect('/notifications');
    })
    .catch(function(err) {
      console.log(err);
      res.redirect('/notifications');
      // return res.status(400).send({msg: ''});
    });
};
