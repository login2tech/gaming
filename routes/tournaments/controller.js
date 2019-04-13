// const fs = require('fs');
const Item = require('./Tournament');
const Team = require('../teams/Team');
const ObjName = 'Tournament';
const moment = require('moment');
const User = require('../../models/User');
const TeamUser = require('../teams/TeamUser');
//
// const giveMoneyToMember = function(uid, input_val) {
//   new User()
//     .where({id: uid})
//     .fetch()
//     .then(function(usr) {
//       if (usr) {
//         let credit_balance = usr.get('credit_balance');
//         const prime = usr.get('prime');
//         if (prime) {
//           credit_balance += parseFloat(input_val);
//         } else {
//           credit_balance += parseFloat((4 / 5) * input_val);
//         }
//
//         usr
//           .save({credit_balance: credit_balance}, {patch: true})
//           .then(function(usr) {})
//           .catch(function(err) {
//             // console.log(err);
//           });
//       }
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
// };
const takeMoneyFromMember = function(uid, input_val) {
  // console.log(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let credit_balance = usr.get('credit_balance');

        // console.log(credit_balance);
        credit_balance -= parseFloat(input_val);
        // console.log(credit_balance);
        usr
          .save({credit_balance: credit_balance}, {patch: true})
          .then(function(usr) {})
          .catch(function(err) {
            // console.log(err);
          });
      }
    })
    .catch(function(err) {
      // console.log(err);
    });
};
//
// const giveXPtoTeam = function(team_id, input_val) {
//   new TeamUser()
//     .where({
//       team_id: team_id,
//       accepted: true
//     })
//     .fetchAll()
//     .then(function(usrs) {
//       usrs = usrs.toJSON();
//       for (let i = 0; i < usrs.length; i++) {
//         const uid = usrs[i].user_id;
//         // giveXpToMember(uid, input_val);
//       }
//     })
//     .catch(function(err) {
//       // console.log(err);
//     });
// };
// const giveMoneyBackToTeam = function(team_id, input_val) {
//   new TeamUser()
//     .where({
//       team_id: team_id,
//       accepted: true
//     })
//     .fetchAll()
//     .then(function(usrs) {
//       usrs = usrs.toJSON();
//       for (let i = 0; i < usrs.length; i++) {
//         const uid = usrs[i].user_id;
//         giveMoneyToMember(uid, input_val);
//       }
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
// };

const takeMoneyFromTeam = function(team_id, input_val) {
  new TeamUser()
    .where({
      team_id: team_id,
      accepted: true
    })
    .fetchAll()
    .then(function(usrs) {
      usrs = usrs.toJSON();
      for (let i = 0; i < usrs.length; i++) {
        const uid = usrs[i].user_id;
        takeMoneyFromMember(uid, input_val);
      }
    })
    .catch(function(err) {
      // console.log(err);
    });
};

exports.listItem = function(req, res, next) {
  new Item()
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['ladder', 'game']})
    .then(function(items) {
      if (!items) {
        return res.status(200).send([]);
      }
      return res.status(200).send({ok: true, items: items.toJSON()});
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(200).send({ok: false, items: []});
    });
};

exports.join = function(req, res, next) {
  //
  if (!req.body.tournament_id) {
    res.status(400).send({ok: false, msg: 'Please enter Tournament ID'});
  }
  if (!req.body.team_id) {
    res.status(400).send({ok: false, msg: 'Please enter Team ID'});
  }
  new Item({id: req.body.tournament_id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: 'Match doesnt exist'
        });
        return;
      }
      const tmp_m = match.toJSON();
      let teams = tmp_m.team_ids;
      const teams_registered = tmp_m.teams_registered;
      const registration_end_at = tmp_m.registration_end_at;
      const registration_start_at = tmp_m.registration_start_at;
      const total_teams = tmp_m.total_teams;
      const mom = moment();
      if (mom.isAfter(registration_end_at)) {
        res.status(400).send({
          ok: false,
          msg: 'Registration Ended already'
          // match: match.toJSON()
        });
        return;
      }
      if (moment(registration_start_at).isAfter(mom)) {
        res.status(400).send({
          ok: false,
          msg: 'Registration Has yet not started'
          // match: match.toJSON()
        });
        return;
      }
      if (teams_registered >= total_teams) {
        res.status(400).send({
          ok: false,
          msg: 'All teams already joined'
          // match: match.toJSON()
        });
        return;
      }
      if (!teams) {
        teams = '';
      }
      teams = teams.split(',');
      // console.log(teams);
      // console.log(teams.indexOf('' + req.body.team_id));
      if (teams.indexOf('' + req.body.team_id) > -1) {
        res.status(400).send({
          ok: false,
          msg: 'Team already joined'
          // match: match.toJSON()
        });
        return;
      }
      teams.push(req.body.team_id);
      teams = teams.join(',');

      match
        .save({
          team_ids: teams,
          teams_registered: teams_registered + 1
          // status: 'accepted'
        })
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Joined successfully.',
            tournament: match.toJSON()
          });

          if (match.get('match_type') != 'free') {
            takeMoneyFromTeam(req.body.team_id, match.get('entry_fee'));
          }
        })
        .catch(function(err) {
          // console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
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
    .fetch({withRelated: ['ladder', 'game', 'matches']})
    .then(function(item) {
      if (!item) {
        return res.status(400).send({
          ok: false,
          id: req.params.id,
          title: '',
          content: ''
        });
      }
      item = item.toJSON();

      console.log(item);

      let team_ids = item.team_ids;
      if (!team_ids) {
        team_ids = '';
      }
      const new_t_id = [];
      team_ids = team_ids.split(',');
      for (let i = 0; i < team_ids.length; i++) {
        if (!team_ids[i]) {
          continue;
        }
        new_t_id.push(parseInt(team_ids[i]));
      }
      if (!new_t_id) {
        new_t_id = [];
      }
      // console.log(new_t_id);
      if (new_t_id && new_t_id.length) {
        new Team()
          .where('id', 'in', new_t_id)
          .fetchAll({
            withRelated: ['team_users', 'team_users.user_info']
          })
          .then(function(data) {
            if (data) {
              data = data.toJSON();
              item.teams = data;
              // return res.status(200).send({ok: true, item: item});
            }
            return res.status(200).send({ok: true, item: item});
          })
          .catch(function(err) {
            // console.log(err);
            return res.status(400).send({
              id: req.params.id,
              title: '',
              content: '',
              msg: 'Failed to fetch from db'
            });
          });
      } else {
        item.teams = [];
        return res.status(200).send({ok: true, item: item});
      }
    })
    .catch(function(err) {
      // console.log(err);
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'Failed to fetch from db'
      });
    });
};

exports.listupcoming = function(req, res, next) {
  new Item()
    .orderBy('created_at', 'DESC')
    .where('starts_at', '>', moment())
    // .where('registration_end_at', '>', moment())
    .fetchAll({withRelated: ['ladder', 'game']})
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

exports.addItem = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item({
    title: req.body.title,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: req.body.starts_at,
    registration_start_at: req.body.registration_start_at,
    registration_end_at: req.body.registration_end_at,
    total_teams: req.body.total_teams,
    entry_fee: req.body.entry_fee,
    first_winner_price: req.body.first_winner_price,
    second_winner_price: req.body.second_winner_price,
    teams_registered: 0,
    third_winner_price: req.body.third_winner_price
  })
    .save()
    .then(function(item) {
      res.send({ok: true, msg: 'New Item has been created successfully.'});
    })
    .catch(function(err) {
      // console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.updateItem = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  // req.assert('content', 'Content cannot be blank').notEmpty();
  // req.assert('slug', 'Fancy URL cannot be blank').notEmpty();
  // req.assert('category_id', 'Category cannot be blank').notEmpty();

  // console.log(req.body);
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const item = new Item({id: req.body.id});
  const obj = {
    title: req.body.title,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: req.body.starts_at,
    registration_start_at: req.body.registration_start_at,
    registration_end_at: req.body.registration_end_at,
    total_teams: req.body.total_teams,
    entry_fee: req.body.entry_fee,
    first_winner_price: req.body.first_winner_price,
    second_winner_price: req.body.second_winner_price,
    third_winner_price: req.body.third_winner_price
  };

  if (req.body.remove_media) {
    obj.image_url = '';
  }
  item
    .save(obj)
    .then(function(blg) {
      blg
        .fetch()
        .then(function(bll) {
          res.send({
            item: bll.toJSON(),
            msg: ObjName + ' has been updated.'
          });
        })
        .catch(function(err) {
          // console.log(err);
          res
            .status(400)
            .send({msg: 'Something went wrong while updating the ' + ObjName});
        });
    })
    .catch(function(err) {
      // console.log(err);

      res
        .status(400)
        .send({msg: 'Something went wrong while updating the ' + ObjName});
    });
};

exports.deleteItem = function(req, res, next) {
  new Item({id: req.body.id})
    .destroy()
    .then(function(post) {
      res.send({msg: 'The ' + ObjName + ' has been successfully deleted.'});
    })
    .catch(function(err) {
      return res
        .status(400)
        .send({msg: 'Something went wrong while deleting the ' + ObjName});
    });
};
