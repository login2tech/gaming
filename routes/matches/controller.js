const moment = require('moment');

const Item = require('./Match');
// const TeamUser = require('../teams/TeamUser');
const User = require('../../models/User');
const Notif = require('../../models/Notification');
const XP = require('../../models/XP');

const getXPBasedOn = function(current_xp) {
  return 10;
};

const giveXpToMember = function(uid, input_val) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let xp = usr.get('life_xp');
        const double_xp = usr.get('double_xp');
        const xP_to_add = getXPBasedOn(xp);

        if (double_xp) {
          xP_to_add = xP_to_add * 2;
        }
        xp += xP_to_add;
        usr
          .save({life_xp: xp})
          .then(function(usr) {})
          .catch(function(err) {});

        const year = moment().format('YYYY');
        const season = moment().format('Q');

        new XP()
          .where({
            year: year,
            season: season,
            user_id: uid
          })
          .fetch()
          .then(function(xpObj) {
            if (xpObj) {
              xpObj.save({
                xp: xpObj.get('xp') + xP_to_add
              });
            } else {
              new XP().save({
                year: year,
                season: season,
                user_id: uid,
                xp: xP_to_add
              });
            }
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    })
    .catch(function(err) {
      console.log(err);
    });
};

const giveMoneyToMember = function(uid, input_val) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get('cash_balance');
        const prime = usr.get('prime');
        if (prime) {
          cash_balance += parseFloat(input_val);
        } else {
          cash_balance += parseFloat((4 / 5) * input_val);
        }

        usr
          .save({cash_balance: cash_balance}, {patch: true})
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

const takeMoneyFromMember = function(uid, input_val) {
  // console.log(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get('cash_balance');

        // console.log(cash_balance);
        cash_balance -= parseFloat(input_val);

        // console.log(cash_balance);
        usr
          .save({cash_balance: cash_balance}, {patch: true})
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

const giveXPtoTeam = function(team_id, players) {
  for (let i = players.length - 1; i >= 0; i--) {
    const uid = parseInt(players[i]);
    giveXpToMember(uid);
  }
  // todo add xp to team as well
  // new TeamUser()
  //   .where({
  //     team_id: team_id,
  //     accepted: true
  //   })
  //   .fetchAll()
  //   .then(function(usrs) {
  //     usrs = usrs.toJSON();
  //     for (let i = 0; i < usrs.length; i++) {
  //       const uid = usrs[i].user_id;
  //       giveXpToMember(uid);
  //     }
  //   })
  //   .catch(function(err) {
  //     // console.log(err);
  //   });
};

const giveMoneyBackToTeam = function(team_id, input_val, team_members) {
  // new TeamUser()
  //   .where({
  //     team_id: team_id,
  //     accepted: true
  //   })
  //   .fetchAll()
  //   .then(function(usrs) {
  //     usrs = usrs.toJSON();
  //     for (let i = 0; i < usrs.length; i++) {
  //       const uid = usrs[i].user_id;
  //       giveMoneyToMember(uid, input_val);
  //     }
  //   })
  //   .catch(function(err) {
  //     // console.log(err);
  // });
  for (let i = team_members.length - 1; i >= 0; i--) {
    giveMoneyToMember(parseInt(team_members[i]), input_val);
  }
};

const takeMoneyFromTeam = function(team_id, input_val, team_members) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    takeMoneyFromMember(parseInt(team_members[i]), input_val);
  }
};

exports.saveScore = function(req, res, next) {
  new Item({id: req.body.id})
    .fetch()
    .then(function(match) {
      if (!match) {
        res.status(400).send({
          ok: false,
          msg: "Match doesn't exist"
        });
        return;
      }
      const val = req.body;
      const tmp_match = match.toJSON();
      if (tmp_match.team_1_result && tmp_match.team_2_result) {
        return res.status(400).send({ok: false, msg: 'Result already saved'});
      }
      if (val.team_1_result && tmp_match.team_2_result) {
        val.team_2_result = tmp_match.team_2_result;
      } else if (val.team_2_result && tmp_match.team_1_result) {
        val.team_1_result = tmp_match.team_1_result;
      }
      if (!val.team_1_result && !val.team_2_result) {
        res.status(400).send({
          ok: false,
          msg: 'Match Data doesnt exist'
        });
        return;
      }

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
      match
        .save(val)
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Score Updated successfully.',
            match: match.toJSON()
          });

          if (val.result == 'team_1' || val.result == 'team_2') {
            let win_team_members =
              val.result == 'team_1'
                ? match.get('team_1_players')
                : match.get('team_2_players');
            win_team_members = win_team_members.split('|');
            console.log(win_team_members);
            const award_team_id =
              val.result == 'team_1'
                ? tmp_match.team_1_id
                : tmp_match.team_2_id;
            giveXPtoTeam(award_team_id, win_team_members);
            if (tmp_match.match_type == 'paid') {
              giveMoneyBackToTeam(
                award_team_id,
                tmp_match.match_fee,
                win_team_members
              );
            }
          }
        })
        .catch(function(err) {
          console.log('1');
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      console.log('2');
      console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
    });
};

exports.join = function(req, res, next) {
  if (!req.body.using_users) {
    res.status(400).send({ok: false, msg: 'Please select team players'});
  }

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
          msg: "Match doesn't exist"
        });
        return;
      }
      match
        .save({
          team_2_id: req.body.team_2_id,
          status: 'accepted',
          team_2_players: req.body.using_users
            ? req.body.using_users.join('|')
            : ''
        })
        .then(function(match) {
          res.status(200).send({
            ok: true,
            msg: 'Joined successfully.',
            match: match.toJSON()
          });

          if (match.get('match_type') != 'free') {
            takeMoneyFromTeam(
              req.body.team_2_id,
              match.get('match_fee'),
              req.body.using_users
            );
          }

          for (let i = req.body.using_users.length - 1; i >= 0; i--) {
            new Notif()
              .save({
                user_id: req.body.using_users[i],
                description: 'You have a pending match',
                type: 'match',
                object_id: match.id
              })
              .then(function() {})
              .catch(function(er) {
                console.log(er);
              });
          }

          let team_1_users = match.get('team_1_players');
          team_1_users = team_1_users.split('|');
          for (let i = team_1_users.length - 1; i >= 0; i--) {
            new Notif()
              .save({
                user_id: parseInt(team_1_users[i]),
                description: 'A team has joined the match',
                type: 'match',
                object_id: match.id
              })
              .then(function() {})
              .catch(function(er) {
                console.log(er);
              });
          }
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Join the match'
          });
        });
    })
    .catch(function(err) {
      // console.log(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Join the match'
      });
    });
};

exports.addItem = function(req, res, next) {
  req.assert('team_1_id', 'Team cannot be blank').notEmpty();
  req.assert('starts_at', 'Starts At cannot be blank').notEmpty();
  req.assert('match_type', 'Match Type cannot be blank').notEmpty();
  req.assert('match_players', 'Match Players cannot be blank').notEmpty();
  req.assert('using_users', 'Match Players cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  new Item({
    team_1_id: req.body.team_1_id,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: req.body.starts_at,
    match_type: req.body.match_type,
    match_players: req.body.match_players,
    match_fee: req.body.match_fee,
    team_1_players: req.body.using_users.join('|')
  })
    .save()
    .then(function(item) {
      res.send({
        ok: true,
        msg: 'New Item has been created successfully.',
        match: item.toJSON()
      });
      if (req.body.match_type == 'paid') {
        takeMoneyFromTeam(
          req.body.team_1_id,
          req.body.match_fee,
          req.body.using_users
        );
      }
      for (let i = req.body.using_users.length - 1; i >= 0; i--) {
        new Notif()
          .save({
            user_id: req.body.using_users[i],
            description: 'You have a pending match',
            type: 'match',
            object_id: item.id
          })
          .then(function() {})
          .catch(function(er) {
            console.log(er);
          });
      }
    })
    .catch(function(err) {
      // console.log(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.matches_of_team = function(req, res, next) {
  new Item()
    .orderBy('created_at', 'DESC')

    .query(function(qb) {
      qb.where('team_1_id', req.query.team_id).orWhere(
        'team_2_id',
        req.query.team_id
      );
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

exports.matches_of_user = function(req, res, next) {
  const teams = req.query.teams.split(',');
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
      // console.log(err);
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'Failed to fetch from db'
      });
    });
};
