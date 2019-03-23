// const fs = require('fs');
const moment = require('moment');

const Item = require('./Match');
// const ItemChild = require('./TeamUser');
const User = require('../../models/User');
const ObjName = 'Match';

exports.matches_of_user = function(req, res, next) {
  const teams = req.query.teams.split(',');
  // const uid = req.query.uid;
  new Item()
    .orderBy('created_at', 'DESC')

    .query(function(qb) {
      qb.where('team_1_id', 'in', teams).orWhere('team_2_id', 'in', teams);
    })
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info', 'team_2_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listupcoming = function(req, res, next) {
  new Item()
    .orderBy('created_at', 'DESC')
    .where('starts_at', '>', moment())
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: true, items: []});
    });
};
exports.saveScore = function(req, res, next) {
  new Item({id: req.body.id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: 'Match doesnt exist'
        });
        return;
      }
      const val = req.body;
      const tmp = match.toJSON();
      if (tmp.team_1_result != '' && tmp.team_2_result != '') {
        return res.status(400).send({ok: false, msg: 'Result already saved'});
      }
      if (val.team_1_result && tmp.team_2_result != '') {
        val.team_2_result = tmp.team_2_result;
      } else if (val.team_2_result && tmp.team_1_result != '') {
        val.team_1_result = tmp.team_1_result;
      }

      console.log(val);
      if (val.team_1_result != '' && val.team_2_result != '') {
        if (val.team_1_result != val.team_2_result) {
          val.status = 'disputed';
          val.result = 'disputed';
        } else {
          const tmp = val.team_1_result.split('-');
          if (parseInt(tmp[0]) > parseInt(tmp[1])) {
            val.result = 'team_1';
            val.status = 'Complete';
          } else if (parseInt(tmp[1]) > parseInt(tmp[0])) {
            val.result = 'team_2';
            val.status = 'Complete';
          } else {
            val.status = 'tie';
            val.result = 'Tie';
          }
        }
      }
      console.log(val);
      match
        .save(val)
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Score Updated successfully.',
            match: match.toJSON()
          });
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
    });
};
exports.join = function(req, res, next) {
  //
  if (!req.body.team_2_id) {
    res.status(400).send({ok: false, msg: 'Please enter Team ID'});
  }
  if (!req.body.match_id) {
    res.status(400).send({ok: false, msg: 'Please enter Match ID'});
  }
  new Item({id: req.body.match_id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: 'Match doesnt exist'
        });
        return;
      }
      match
        .save({
          team_2_id: req.body.team_2_id,
          status: 'accepted'
        })
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Joined successfully.',
            match: match.toJSON()
          });
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
    });
};

exports.listItem = function(req, res, next) {
  new Item()
    // .where('id', req.params.id)
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
    })
    .catch(function(err) {
      return res.status(200).send({ok: true, items: []});
    });
};
exports.listPaged = function(req, res, next) {
  let c = new Item();
  c = c.orderBy('id', 'DESC');

  let p;
  if (req.query.paged && parseInt(req.query.paged) > 1) {
    p = parseInt(req.query.paged);
  } else {
    p = 1;
  }
  c.fetchPage({page: p, pageSize: 10})
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }
      return res
        .status(200)
        .send({ok: true, items: items.toJSON(), pagination: items.pagination});
    })
    .catch(function(err) {
      // console.log(err)
      return res.status(200).send([]);
    });
};

exports.listSingleItem = function(req, res, next) {
  new Item()
    .where('id', req.params.id)
    .fetch({
      withRelated: [
        'ladder',
        'game',
        'team_1_info',

        'team_1_info.team_users',
        'team_1_info.team_users.user_info',
        'team_2_info',

        'team_2_info.team_users',
        'team_2_info.team_users.user_info'
      ]
    })
    .then(function(item) {
      if (!item) {
        return res.status(200).send({id: req.params.id});
      }
      return res.status(200).send({ok: true, item: item.toJSON()});
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'Failed to fetch from db'
      });
    });
};

exports.addItem = function(req, res, next) {
  req.assert('team_1_id', 'Team cannot be blank').notEmpty();
  req.assert('starts_at', 'Starts At cannot be blank').notEmpty();
  req.assert('match_type', 'Match Type cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item(req.body)
    .save()
    .then(function(item) {
      res.send({
        ok: true,
        msg: 'New Item has been created successfully.',
        match: item.toJSON()
      });
      if (req.body.match_type == 'paid') {
        // block amount
      }
      // new ItemChild({
      //   team_id: item.id,
      //   user_id: req.user.id,
      //   accepted: true
      // }).save();
    })
    .catch(function(err) {
      console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};
