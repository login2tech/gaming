const moment = require('moment');

const Item = require('./Match');
// const TeamUser = require('../teams/TeamUser');
const User = require('../../models/User');
const Notif = require('../../models/Notification');
const XP = require('../../models/XP');
const TeamXP = require('../../models/TeamXP');
const CashTransactions = require('../../models/CashTransactions');
const CreditTransactions = require('../../models/CreditTransactions');
const XPTransactions = require('../../models/XPTransactions');
const Score = require('../../models/Score');
const TeamScore = require('../../models/TeamScore');
const Ticket = require('../tickets/Ticket');
const utils = require('../utils');

const Raven = require('raven');
const getXPBasedOn = function(current_xp, match_type) {
  return 15;
};
const getXPRemoveBasedOn = function(current_xp) {
  return 7;
};
const getTeamWpForWinner = function() {
  return 15;
};

const getTeamWpForLooser = function() {
  return 7;
};

const giveXpToMember = function(uid, match_id, match_type, force_xp_to_add) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let xp = usr.get('life_xp');
        const double_xp = usr.get('double_xp');
        let xP_to_add;
        if (force_xp_to_add) {
          xP_to_add = force_xp_to_add;
        } else {
          xP_to_add = getXPBasedOn(xp, match_type);
        }

        if (double_xp) {
          xP_to_add = xP_to_add * 2;
        }
        xp += xP_to_add;
        usr
          .save({life_xp: xp}, {patch: true})
          .then(function(usr) {})
          .catch(function(err) {
            Raven.captureException(err);
          });

        const season_obj = utils.get_current_season();
        const year = season_obj[0];
        const season = season_obj[1];

        new XP()
          .where({
            year: year,
            season: season,
            user_id: uid
          })
          .fetch()
          .then(function(xpObj) {
            if (xpObj) {
              xpObj
                .save({
                  xp: xpObj.get('xp') + xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  Raven.captureException(err);
                });
            } else {
              new XP()
                .save({
                  year: year,
                  season: season,
                  user_id: uid,
                  xp: xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  Raven.captureException(err);
                });
            }
            let xtxt = '';
            if (match_type == 't') {
              xtxt = ' tournament';
            }
            new XPTransactions()
              .save({
                user_id: uid,
                obj_type: 'm_' + match_id,
                details: 'XP Credit for winning' + xtxt + ' match #' + match_id,
                qty: xP_to_add
              })
              .then(function(o) {})
              .catch(function(err) {
                Raven.captureException(err);
              });
          })
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

const takeXpFromMember = function(uid, match_id, match_type) {
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let xp = usr.get('life_xp');
        // const double_xp = usr.get('double_xp');
        const xP_to_add = getXPRemoveBasedOn(xp);

        xp -= xP_to_add;
        usr
          .save({life_xp: xp}, {patch: true})
          .then(function(usr) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
        const season_obj = utils.get_current_season();
        const year = season_obj[0];
        const season = season_obj[1];

        new XP()
          .where({
            year: year,
            season: season,
            user_id: uid
          })
          .fetch()
          .then(function(xpObj) {
            if (xpObj) {
              xpObj
                .save({
                  xp: xpObj.get('xp') - xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  Raven.captureException(err);
                });
            } else {
              new XP()
                .save({
                  year: year,
                  season: season,
                  user_id: uid,
                  xp: -xP_to_add
                })
                .then(function(o) {})
                .catch(function(err) {
                  Raven.captureException(err);
                });
            }
            let xtxt = '';
            if (match_type == 't') {
              xtxt = ' tournament';
            }
            new XPTransactions()
              .save({
                user_id: uid,
                obj_type: 'm_' + match_id,
                details: 'XP Debit for lossing' + xtxt + ' match #' + match_id,
                qty: -xP_to_add
              })
              .then(function(o) {})
              .catch(function(err) {
                Raven.captureException(err);
              });
          })
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

const addScoreForMember = function(uid, ladder_id, game_id, type) {
  const season_obj = utils.get_current_season();
  const year = season_obj[0];
  const season = season_obj[1];

  new Score()
    .where({
      year: year,
      ladder_id: ladder_id,

      season: season,
      user_id: uid
    })
    .fetch()
    .then(function(scoreObj) {
      if (scoreObj) {
        scoreObj
          .save({
            game_id: game_id,
            [type]: scoreObj.get(type) + 1
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      } else {
        new Score()
          .save({
            year: year,
            season: season,
            game_id: game_id,
            user_id: uid,
            ladder_id: ladder_id,
            [type]: 1
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
  // console.log('208')

  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      let tpye_val;
      if (usr) {
        tpye_val = usr.get(type);
        tpye_val++;
        usr
          .save({[type]: tpye_val}, {patch: true})
          .then(function(usr) {
            // console.log('221');
          })
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

const giveMoneyToMember = function(uid, input_val, match_id, type) {
  let typ = '';
  if (type == 'cash' || type == 'cash_balance') {
    typ = 'cash_balance';
  } else if (
    type == 'credit' ||
    type == 'credit_balance' ||
    type == 'credits'
  ) {
    typ = 'credit_balance';
  }

  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        let cash_balance = usr.get(typ);
        let life_earning = usr.get('life_earning');

        const prime = usr.get('prime');
        let val;

        if (prime) {
          val = parseFloat(input_val) + parseFloat(input_val);
          if (typ == 'cash_balance') {
            life_earning += parseFloat(input_val);
          }
        } else {
          val =
            parseFloat((4 / 5) * parseFloat(input_val)) + parseFloat(input_val);
          if (typ == 'cash_balance') {
            life_earning += parseFloat(input_val);
          }
        }

        cash_balance += val;

        usr
          .save(
            {[typ]: cash_balance, life_earning: life_earning},
            {patch: true}
          )
          .then(function(usr) {
            let ct;
            if (typ == 'cash_balance') {
              ct = new CashTransactions();
            } else {
              ct = new CreditTransactions();
            }
            ct.save({
              user_id: uid,
              obj_type: 'm_' + match_id,
              details: 'Credit for winning match #' + match_id,
              qty: val
            })
              .then(function(o) {})
              .catch(function(err) {
                Raven.captureException(err);
              });
          })
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

const takeMoneyFromMember = function(uid, input_val, match_id, type) {
  // console.log(input_val);
  new User()
    .where({id: uid})
    .fetch()
    .then(function(usr) {
      if (usr) {
        // const cash_balance = usr.get('cash_balance');

        let obj;
        // cash_balance -= parseFloat(input_val);

        if (type == 'cash') {
          let cash_balance = usr.get('cash_balance');
          cash_balance -= parseFloat(input_val);
          obj = {cash_balance: cash_balance};
        } else if (type == 'credits') {
          let credit_balance = usr.get('credit_balance');
          credit_balance -= parseFloat(input_val);
          obj = {credit_balance: credit_balance};
        }

        // console.log(cash_balance);
        usr
          .save(obj, {patch: true})
          .then(function(usr) {
            let ct;
            if (type == 'cash') {
              ct = new CashTransactions();
            } else {
              ct = new CreditTransactions();
            }
            ct.save({
              user_id: uid,
              details: type + ' debit for joining match #' + match_id,
              qty: -parseFloat(input_val)
            })
              .then(function(o) {})
              .catch(function(err) {
                Raven.captureException(err);
              });
          })
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};
// this is also being used in tournaments, edit at your own risk
const giveXPtoTeam = function(
  team_id,
  players,
  match_id,
  match_type,
  xp_amount
) {
  for (let i = players.length - 1; i >= 0; i--) {
    const uid = parseInt(players[i]);
    giveXpToMember(uid, match_id, match_type, xp_amount);
  }

  let xP_to_add;
  if (xp_amount) {
    xP_to_add = xp_amount;
  } else {
    xP_to_add = getTeamWpForWinner();
  }
  const season_obj = utils.get_current_season();
  const year = season_obj[0];
  const season = season_obj[1];
  new TeamXP()
    .where({
      year: year,
      season: season,
      team_id: team_id
    })
    .fetch()
    .then(function(xpObj) {
      if (xpObj) {
        xpObj
          .save({
            xp: xpObj.get('xp') + xP_to_add
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      } else {
        new TeamXP()
          .save({
            year: year,
            season: season,
            team_id: team_id,
            xp: xP_to_add
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

const takeXPfromTeam = function(team_id, players, match_id, match_type) {
  for (let i = players.length - 1; i >= 0; i--) {
    const uid = parseInt(players[i]);
    takeXpFromMember(uid, match_id, match_type);
  }
  const xP_to_add = getTeamWpForLooser();
  const season_obj = utils.get_current_season();
  const year = season_obj[0];
  const season = season_obj[1];

  new TeamXP()
    .where({
      year: year,
      season: season,
      team_id: team_id
    })
    .fetch()
    .then(function(xpObj) {
      if (xpObj) {
        xpObj
          .save({
            xp: xpObj.get('xp') - xP_to_add
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      } else {
        new TeamXP()
          .save({
            year: year,
            season: season,
            team_id: team_id,
            xp: -xP_to_add
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

exports.takeXPfromTeam = takeXPfromTeam;
exports.giveXPtoTeam = giveXPtoTeam;

const giveMoneyBackToTeam = function(
  team_id,
  input_val,
  team_members,
  match_id,
  type
) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    giveMoneyToMember(parseInt(team_members[i]), input_val, match_id, type);
  }
};

const takeMoneyFromTeam = function(
  team_id,
  input_val,
  team_members,
  match_id,
  type
) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    takeMoneyFromMember(parseInt(team_members[i]), input_val, match_id, type);
  }
};

const addScoreForTeam = function(
  game_id,
  ladder_id,
  type,
  team_members,
  team_id
) {
  for (let i = team_members.length - 1; i >= 0; i--) {
    addScoreForMember(parseInt(team_members[i]), ladder_id, game_id, type);
  }
  const season_obj = utils.get_current_season();
  const year = season_obj[0];
  const season = season_obj[1];
  new TeamScore()
    .where({
      year: year,
      ladder_id: ladder_id,
      game_id: game_id,
      season: season,
      team_id: team_id
    })
    .fetch()
    .then(function(scoreObj) {
      if (scoreObj) {
        scoreObj
          .save({
            game_id: game_id,
            [type]: scoreObj.get(type) + 1
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      } else {
        new TeamScore()
          .save({
            year: year,
            season: season,
            team_id: team_id,
            game_id: game_id,
            ladder_id: ladder_id,
            [type]: 1
          })
          .then(function(o) {})
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

const resolveDispute = function(
  req,
  res,
  next,
  m_id,
  win_to,
  proceed_if_no_dispute
) {
  let match_id;
  let winner;
  if (req) {
    match_id = req.body.id;
    winner = req.body.winner;
  } else {
    match_id = m_id;
    winner = win_to;
  }
  new Item({id: match_id})
    .fetch()
    .then(function(match) {
      // console.log('problem?');
      if (!match) {
        if (res) {
          return res.status(400).send({
            ok: false,
            msg: "Match doesn't exist"
          });
        } else {
          return;
        }
      }
      const tmp_match = match.toJSON();
      if (tmp_match.result != 'disputed') {
        if (res) {
          return res.status(400).send({
            ok: false,
            msg: 'Match not disputed'
          });
        } else {
          if (proceed_if_no_dispute) {
            console.log('allowing this time! was a sudo');
          } else {
            console.log('resolving dispute? create a dispute first!');
            return;
          }
        }
      }
      const final_result = winner;
      if (final_result != 'team_1' && final_result != 'team_2') {
        if (res) {
          return res.status(400).send({
            ok: false,
            msg: 'Thats not a valid result'
          });
        } else {
          return;
        }
      }
      const saved_info = {
        status: 'complete',
        result: final_result
      };
      if (proceed_if_no_dispute) {
        if (saved_info.result == 'team_1') {
          saved_info.team_2_result = tmp_match.team_1_result;
        } else if (saved_info.result == 'team_2') {
          saved_info.team_1_result = tmp_match.team_2_result;
        }
      }

      match
        .save(saved_info, {method: 'update'})
        .then(function(match) {
          if (res) {
            res.status(200).send({
              ok: true,
              msg: 'Dispute resolved successfully',
              match: match.toJSON()
            });
          }

          console.log('here.. dispute resolved');
          new Ticket()
            .where({
              extra_1: match.get('id'),
              extra_3: 'MatchFinder',
              status: 'submitted'
            })
            .save(
              {
                status: 'closed'
              },
              {
                method: 'update'
              }
            )
            .then(function(a) {
              console.log('done');
              //
            })
            .catch(function(err) {
              console.log(err);
              //
            });

          if (final_result != 'team_1' && final_result != 'team_2') {
            return;
          }

          // get players
          let win_team_members;
          let loose_team_members;
          if (final_result == 'team_1') {
            win_team_members = match.get('team_1_players');
            loose_team_members = match.get('team_2_players');
          } else {
            win_team_members = match.get('team_2_players');
            loose_team_members = match.get('team_1_players');
          }
          win_team_members = win_team_members.split('|');
          loose_team_members = loose_team_members.split('|');

          // get winner team id
          const award_team_id =
            final_result == 'team_1'
              ? tmp_match.team_1_id
              : tmp_match.team_2_id;
          const loose_team_id =
            final_result == 'team_1'
              ? tmp_match.team_2_id
              : tmp_match.team_1_id;

          // giveWinToTeam(award_team_id,win_team_members,  tmp_match.id);
          giveXPtoTeam(award_team_id, win_team_members, tmp_match.id);
          takeXPfromTeam(loose_team_id, loose_team_members, tmp_match.id);

          if (
            tmp_match.match_type == 'credits' ||
            tmp_match.match_type == 'cash'
          ) {
            giveMoneyBackToTeam(
              award_team_id,
              tmp_match.match_fee,
              win_team_members,
              tmp_match.id,
              tmp_match.match_type
            );
          }
          // console.log('score resotlo');
          addScoreForTeam(
            tmp_match.game_id,
            tmp_match.ladder_id,
            'wins',
            win_team_members,
            award_team_id
          );
          addScoreForTeam(
            tmp_match.game_id,
            tmp_match.ladder_id,
            'loss',
            loose_team_members,
            loose_team_id
          );
        })
        .catch(function(err) {
          Raven.captureException(err);
          if (res) {
            res.status(400).send({
              ok: false,
              msg: 'Failed to resolve the dispute'
            });
          }
        });
    })
    .catch(function(err) {
      console.log('error');
      Raven.captureException(err);
      if (res) {
        res.status(400).send({
          ok: false,
          msg: 'Failed to resolve dispute'
        });
      }
    });
};

exports.resolveDispute = resolveDispute;

exports.resolveDisputeWrap = function(req, res, next) {
  resolveDispute(req, res, next);
};

const giveWin = function(req, res, next, match_id, team_to_win) {
  new Item({id: match_id})
    .fetch()
    .then(function(match) {
      const tmp_match = match.toJSON();
      if (tmp_match.team_1_result && tmp_match.team_2_result) {
        return;
      }
      const obj_to_save = {};

      if (team_to_win == 'team_2') {
        obj_to_save.team_1_result = '0-1';
        obj_to_save.team_2_result = '1-0';
      } else {
        obj_to_save.team_2_result = '0-1';
        obj_to_save.team_1_result = '1-0';
      }
      obj_to_save.result = team_to_win;
      obj_to_save.status = 'complete';

      match
        .save(obj_to_save)
        .then(function(match) {
          if (
            obj_to_save.result == 'team_1' ||
            obj_to_save.result == 'team_2'
          ) {
            let win_team_members;
            let loose_team_members;
            if (obj_to_save.result == 'team_1') {
              win_team_members = match.get('team_1_players');
              loose_team_members = match.get('team_2_players');
            } else {
              win_team_members = match.get('team_2_players');
              loose_team_members = match.get('team_1_players');
            }

            win_team_members = win_team_members.split('|');
            loose_team_members = loose_team_members.split('|');

            const award_team_id =
              obj_to_save.result == 'team_1'
                ? tmp_match.team_1_id
                : tmp_match.team_2_id;
            const loose_team_id =
              obj_to_save.result == 'team_1'
                ? tmp_match.team_2_id
                : tmp_match.team_1_id;

            // giveWinToTeam(award_team_id,win_team_members,  tmp_match.id);
            giveXPtoTeam(award_team_id, win_team_members, tmp_match.id);
            takeXPfromTeam(loose_team_id, loose_team_members, tmp_match.id);

            if (
              tmp_match.match_type == 'credits' ||
              tmp_match.match_type == 'cash'
            ) {
              giveMoneyBackToTeam(
                award_team_id,
                tmp_match.match_fee,
                win_team_members,
                tmp_match.id,
                tmp_match.match_type
              );
            }
            // console.log('score resotlo');
            // console.log(award_team_id, loose_team_id);
            addScoreForTeam(
              tmp_match.game_id,
              tmp_match.ladder_id,
              'wins',
              win_team_members,
              award_team_id
            );
            addScoreForTeam(
              tmp_match.game_id,
              tmp_match.ladder_id,
              'loss',
              loose_team_members,
              loose_team_id
            );
          }
        })
        .catch(function(err) {
          Raven.captureException(err);
        });

      // obj_to_save;

      // if (val.team_1_result && tmp_match.team_2_result) {
      //   val.team_2_result = tmp_match.team_2_result;
      // } else if (val.team_2_result && tmp_match.team_1_result) {
      //   val.team_1_result = tmp_match.team_1_result;
      // }
    })
    .catch(function(err) {
      Raven.captureException(err);
    });
};

exports.giveWin = giveWin;

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

      if (val.team_1_result && val.team_2_result) {
        // const team_1_score = val.team_1_result.split('-');
        const team_2_score = val.team_2_result.split('-');
        const team_2_score_reverse = team_2_score[1] + '-' + team_2_score[0];
        if (val.team_1_result != team_2_score_reverse) {
          val.status = 'disputed';
          val.result = 'disputed';
        } else {
          const tmp = val.team_1_result.split('-');
          if (parseInt(tmp[0]) > parseInt(tmp[1])) {
            val.result = 'team_1';
            val.status = 'complete';
          } else if (parseInt(tmp[1]) > parseInt(tmp[0])) {
            val.result = 'team_2';
            val.status = 'complete';
          } else {
            val.status = 'tie';
            val.result = 'Tie';
          }
        }
      } else {
        // pehle se result koi b ni posted, first time post ho rha h but lose dala h khud ka toh close match
        // console.log(
        // 'pehle se result koi b ni posted, first time post ho rha h but lose dala h khud ka toh close match'
        // );
        // const winner = false;
        // console.log(val);
        if (val.team_1_result) {
          const tmp = val.team_1_result.split('-');
          const team_1_score_reverse = tmp[1] + '-' + tmp[0];
          if (parseInt(tmp[0]) < parseInt(tmp[1])) {
            val.result = 'team_2';
            val.team_2_result = team_1_score_reverse;
            val.status = 'complete';
          }
        } else if (val.team_2_result) {
          const tmp = val.team_2_result.split('-');
          const team_2_score_reverse = tmp[1] + '-' + tmp[0];
          if (parseInt(tmp[1]) > parseInt(tmp[0])) {
            val.result = 'team_1';
            val.team_1_result = team_2_score_reverse;
            val.status = 'complete';
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
            // let t_1_p = match.get('team_1_players');
            // t_1_p = t_1_p.split('|');

            // let t_2_p = match.get('team_2_players');
            // t_2_p = t_2_p.split('|');
            let win_team_members;
            let loose_team_members;
            if (val.result == 'team_1') {
              win_team_members = match.get('team_1_players');
              loose_team_members = match.get('team_2_players');
            } else {
              win_team_members = match.get('team_2_players');
              loose_team_members = match.get('team_1_players');
            }
            // console.log('winers are ', win_team_members);
            // console.log('lossers are ', loose_team_members);

            win_team_members = win_team_members.split('|');
            loose_team_members = loose_team_members.split('|');

            const award_team_id =
              val.result == 'team_1'
                ? tmp_match.team_1_id
                : tmp_match.team_2_id;
            const loose_team_id =
              val.result == 'team_1'
                ? tmp_match.team_2_id
                : tmp_match.team_1_id;

            // giveWinToTeam(award_team_id,win_team_members,  tmp_match.id);
            giveXPtoTeam(award_team_id, win_team_members, tmp_match.id);
            takeXPfromTeam(loose_team_id, loose_team_members, tmp_match.id);

            if (
              tmp_match.match_type == 'credits' ||
              tmp_match.match_type == 'cash'
            ) {
              giveMoneyBackToTeam(
                award_team_id,
                tmp_match.match_fee,
                win_team_members,
                tmp_match.id,
                tmp_match.match_type
              );
            }
            // console.log('score resotlo');
            // console.log(award_team_id, loose_team_id);
            addScoreForTeam(
              tmp_match.game_id,
              tmp_match.ladder_id,
              'wins',
              win_team_members,
              award_team_id
            );
            addScoreForTeam(
              tmp_match.game_id,
              tmp_match.ladder_id,
              'loss',
              loose_team_members,
              loose_team_id
            );
          }
        })
        .catch(function(err) {
          Raven.captureException(err);
          res.status(400).send({
            ok: false,
            msg: 'Failed to Save Score'
          });
        });
    })
    .catch(function(err) {
      Raven.captureException(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Save Score'
      });
    });
};

const join_inner = function(match, req, res, next) {
  match
    .save({
      team_2_id: req.body.team_2_id,
      status: 'accepted',
      is_available_now: false,
      starts_at: match.get('is_available_now')
        ? moment().add(10, 'minutes')
        : match.get('starts_at'),
      team_2_players: req.body.using_users ? req.body.using_users.join('|') : ''
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
          req.body.using_users,
          match.id,
          match.get('match_type')
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
          .then(function() {
            //
          })
          .catch(function(err) {
            Raven.captureException(err);
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
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Join the match'
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

      // console.log(req.body);

      new Item()
        .where({
          team_1_id: req.body.team_2_id,
          team_2_id: match.get('team_1_id')
        })
        .where('starts_at', '>', moment().subtract(3, 'hours'))
        .where('status', '!=', 'cancelled')
        .fetch()
        .then(function(old_matches) {
          //old_matches
          // console.log(old_matches.toJSON());

          if (old_matches) {
            return res.status(400).send({
              ok: false,
              msg:
                'You had a match with this team already Wait 3 hours to play this team again.'
            });
          } else {
            new Item()
              .where({
                team_2_id: req.body.team_2_id,
                team_1_id: match.get('team_1_id')
              })
              .where('starts_at', '>', moment().subtract(3, 'hours'))
              .where('status', '!=', 'cancelled')
              .fetch()
              .then(function(old_matches) {
                if (old_matches) {
                  return res.status(400).send({
                    ok: false,
                    msg:
                      'You had a Match with this team already Wait 3 hours to play this team again.'
                  });
                } else {
                  return join_inner(match, req, res, next);
                }
              });
          }
        })
        .catch(function(err) {
          Raven.captureException(err);
          return res.status(400).send({
            ok: false,
            msg: 'Failed to accept match'
          });
        });
    })
    .catch(function(err) {
      Raven.captureException(err);
      res.status(400).send({
        ok: false,
        msg: 'Failed to Join the match'
      });
    });
};

exports.addItem = function(req, res, next) {
  req.assert('team_1_id', 'Team cannot be blank').notEmpty();
  req.assert('match_starts_in', 'Starts At cannot be blank').notEmpty();
  req.assert('match_type', 'Match Type cannot be blank').notEmpty();
  req.assert('match_players', 'Match Players cannot be blank').notEmpty();
  req.assert('using_users', 'Match Players cannot be blank').notEmpty();

  // console.log(req.body.game_settings);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }
  let starts_at = req.body.match_starts_in;
  starts_at = starts_at.split('|');
  new Item({
    team_1_id: req.body.team_1_id,
    game_id: req.body.game_id,
    ladder_id: req.body.ladder_id,
    starts_at: moment().add(starts_at[0], starts_at[1]),
    match_type: req.body.match_type,
    is_available_now: req.body.match_starts_in == '61|minutes' ? true : false,
    game_settings: req.body.game_settings
      ? JSON.stringify(req.body.game_settings)
      : '{}',
    match_players: req.body.match_players,
    match_fee: req.body.match_fee,
    team_1_players: req.body.using_users.join('|')
  })
    .save()
    .then(function(item) {
      res.send({
        ok: true,
        msg: 'New Match has been created successfully.',
        match: item.toJSON()
      });
      if (req.body.match_type == 'credits' || req.body.match_type == 'cash') {
        takeMoneyFromTeam(
          req.body.team_1_id,
          req.body.match_fee,
          req.body.using_users,
          item.id,
          req.body.match_type
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
          .catch(function(err) {
            Raven.captureException(err);
          });
      }
    })
    .catch(function(err) {
      Raven.captureException(err);
      return res
        .status(400)
        .send({msg: 'Something went wrong while created a new Item'});
    });
};

exports.matches_of_team = function(req, res, next) {
  let mdl = new Item();
  mdl = mdl.orderBy('created_at', 'DESC');
  if (req.query.exclude_pending == 'yes') {
    mdl = mdl.where('status', 'NOT LIKE', 'pending');
  }
  mdl = mdl.query(function(qb) {
    qb.where('team_1_id', req.query.team_id).orWhere(
      'team_2_id',
      req.query.team_id
    );
  });

  mdl
    .fetchAll({withRelated: ['ladder', 'game', 'team_1_info', 'team_2_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      return res.status(200).send({ok: true, items: item.toJSON()});
    })
    .catch(function(err) {
      Raven.captureException(err);
      return res.status(200).send({ok: true, items: []});
    });
};
exports.pendingScoreMatches = function(req, res, next) {
  // console.log(req.query);
  let teams = req.query.teams;
  if (!teams || teams == '') {
    teams = [];
  } else {
    teams = teams.split(',');
  }
  teams = teams.map(function(l) {
    return parseInt(l);
  });
  let mdl = new Item();

  mdl = mdl.query(function(qb) {
    qb.where('status', 'LIKE', 'accepted');
  });

  mdl = mdl.query(function(qb) {
    qb.where('team_1_id', 'in', teams).orWhere('team_2_id', 'in', teams);
  });

  mdl
    .fetchAll()
    .then(function(items) {
      if (!items) {
        return res.status(200).send({ok: true, any_pending: false});
      }
      items = items.toJSON();
      for (let i = 0; i < items.length; i++) {
        const match = items[i];
        let players = [];
        let team_score = '';
        if (teams.indexOf(match.team_1_id) > -1) {
          team_score = match.team_1_score;
          players = match.team_1_players.split('|');
        } else if (teams.indexOf(match.team_2_id) > -1) {
          team_score = match.team_2_score;
          players = match.team_2_players.split('|');
        }

        players = players.map(function(l) {
          return parseInt(l);
        });
        // player is in match
        if (players.indexOf(parseInt(req.query.uid)) > -1) {
          // player's team hasnt even given score
          if (!team_score) {
            return res.status(200).send({ok: true, any_pending: true});
          }
        }
      }
      // all matches traversed, not even a single satisfies
      return res.status(200).send({ok: true, any_pending: false});
    })
    .catch(function(err) {
      Raven.captureException(err);
      return res.status(200).send({ok: true, any_pending: false});
    });
};

exports.matches_of_user = function(req, res, next) {
  // console.log(req.query);
  let teams = req.query.teams;
  if (!teams || teams == '') {
    teams = [];
  } else {
    teams = teams.split(',');
  }
  let mdl = new Item();
  mdl = mdl.orderBy('created_at', 'DESC');

  // console.log(teams);

  mdl = mdl.query(function(qb) {
    qb.where(function(qb) {
      qb.where('team_1_id', 'in', teams).orWhere('team_2_id', 'in', teams);
    });
  });

  if (req.query.exclude_pending == 'yes') {
    // console.log('yesysey');
    mdl = mdl.where('status', 'NOT LIKE', 'pending');
    // mdl = mdl.where('status', '!=', 'pending');
  }
  if (req.query.only_pending == 'yes') {
    mdl = mdl.where('status', 'in', ['pending', 'accepted']);
  }

  mdl
    .fetchPage({
      page: req.query.page ? req.query.page : 1,
      pageSize: 5,
      withRelated: ['ladder', 'game', 'team_1_info', 'team_2_info']
    })

    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: [], r: 'EMPTY'});
      }
      return res
        .status(200)
        .send({ok: true, items: item.toJSON(), pagination: item.pagination});
    })
    .catch(function(err) {
      Raven.captureException(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listupcoming = function(req, res, next) {
  let a = new Item()
    .orderBy('game_id', 'DESC')
    // .orderBy('created_at', 'DESC')
    .where('starts_at', '>', moment())
    .where('status', '=', 'pending');

  if (req.query.filter_id) {
    a = a.where({
      game_id: req.query.filter_id
    });
  }
  if (req.query.filter_ladder) {
    a = a.where({
      ladder_id: req.query.filter_ladder
    });
  }

  a.fetchAll({withRelated: ['ladder', 'game', 'team_1_info']})
    .then(function(item) {
      if (!item) {
        return res.status(200).send({ok: true, items: []});
      }
      item = item.toJSON();
      let totals = 0;
      const games_obj = {};
      for (let i = item.length - 1; i >= 0; i--) {
        if (!games_obj['game_' + item[i].game_id]) {
          games_obj['game_' + item[i].game_id] = [];
        }
        games_obj['game_' + item[i].game_id].push(item[i]);
        totals++;
      }

      return res
        .status(200)
        .send({ok: true, items: games_obj, total_upcoming: totals});
    })
    .catch(function(err) {
      Raven.captureException(err);
      return res.status(200).send({ok: true, items: []});
    });
};

exports.listrecent = function(req, res, next) {
  let a = new Item();
  a = a.orderBy('id', 'DESC');
  a = a.where('starts_at', '<', moment());
  a = a.where('status', 'complete');

  if (req.query.filter_id) {
    a = a.where({
      game_id: req.query.filter_id
    });
  }
  if (req.query.filter_ladder) {
    a = a.where({
      ladder_id: req.query.filter_ladder
    });
  }

  if (req.query.limit) {
    a = a.fetchPage({
      page: 0,
      pageSize: req.query.limit,
      withRelated: ['ladder', 'ladder.game_info', 'team_1_info', 'team_2_info']
    });
  } else {
    a = a.fetchPage({
      page: 0,
      pageSize: 20,
      withRelated: ['ladder', 'team_1_info', 'team_2_info']
    });
  }

  a.then(function(items) {
    if (!items) {
      return res.status(200).send({ok: true, items: []});
    }
    items = items.toJSON();
    return res.status(200).send({ok: true, items: items});
  }).catch(function(err) {
    Raven.captureException(err);
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
      Raven.captureException(err);
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
      Raven.captureException(err);
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
      Raven.captureException(err);
      return res.status(400).send({
        id: req.params.id,
        title: '',
        content: '',
        msg: 'Failed to fetch from db'
      });
    });
};

exports.leave_match = function(req, res, next) {
  if (!req.body.match_id) {
    res.status(400).send({ok: false, msg: 'Please enter Match ID'});
    return;
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
      if (
        match.get('status') != 'accepted' &&
        match.get('status') != 'pending'
      ) {
        return res
          .status(400)
          .send({ok: false, msg: 'Match can not be cancelled at this stage.'});
      }
      if (req.body.do_cancel) {
        return match
          .save({
            cancel_requested: false,
            cancel_requested_by: ''
          })
          .then(function(m) {
            let notify = '';
            if (req.body.team == 'team_1') {
              notify = match.get('team_2_players');
            } else if (req.body.team == 'team_2') {
              notify = match.get('team_1_players');
            }
            notify = ('' + notify)
              .split('|')
              .filter(function(item) {
                if (item != '') {
                  return true;
                }
                return false;
              })
              .map(function(item) {
                return parseInt(item);
              });
            for (let i = 0; i < notify.length; i++) {
              new Notif()
                .save({
                  user_id: notify[i],
                  description:
                    'Other Team has rejected your cancellation request.',
                  type: 'match',
                  object_id: match.id
                })
                .then(function() {
                  //
                })
                .catch(function() {
                  //
                });
            }
            return res
              .status(200)
              .send({ok: true, msg: 'Match cancellation request cancelled.'});
          })
          .catch(function(err) {
            res
              .status(400)
              .send({ok: false, msg: 'Cancel Match cancellation Failed.'});
          });
      }
      // console.log('leave api');
      if (match.get('cancel_requested')) {
        const requested_by = match.get('cancel_requested_by');
        if (req.body.team != requested_by) {
          // cancel kr match ko. refund cron kr dega.
          return match
            .save({
              status: 'cancelled'
            })
            .then(function(m) {
              let msg;
              if (m.get('match_type') == 'free') {
                msg = 'Match has been cancelled.';
              } else {
                msg = 'Match has been cancelled. You will get refunds shortly';
              }
              let notify;
              if (req.body.team == 'team_1') {
                notify = match.get('team_2_players');
              } else if (req.body.team == 'team_2') {
                notify = match.get('team_1_players');
              }
              notify = ('' + notify)
                .split('|')
                .filter(function(item) {
                  if (item != '') {
                    return true;
                  }
                  return false;
                })
                .map(function(item) {
                  return parseInt(item);
                });
              for (let i = 0; i < notify.length; i++) {
                new Notif()
                  .save({
                    user_id: notify[i],
                    description:
                      'Other Team has accepted your cancellation request',
                    type: 'match',
                    object_id: match.id
                  })
                  .then(function() {
                    //
                  })
                  .catch(function() {
                    //
                  });
              }
              return res.status(200).send({ok: true, msg: msg});
            })
            .catch(function(err) {
              return res
                .status(400)
                .send({ok: false, msg: 'Match cancellation Failed.'});
            });
        } else {
          return res
            .status(200)
            .send({ok: true, msg: 'Match cancellation requested'});
        }
      } else if (match.get('status') == 'pending') {
        return match
          .save({
            status: 'cancelled'
          })
          .then(function(m) {
            let msg2 = '';
            if (match.get('match_type') != 'free') {
              msg2 = ' You will get refunds shorty.';
            }
            res.status(200).send({ok: true, msg: 'Match cancelled.' + msg2});
          })
          .catch(function(err) {
            res
              .status(400)
              .send({ok: false, msg: 'Match cancellation Failed.'});
          });
      } else {
        return match
          .save({
            cancel_requested: true,
            cancel_requested_by: req.body.team
          })
          .then(function(m) {
            let notify = '';
            if (req.body.team == 'team_1') {
              notify = match.get('team_2_players');
            } else if (req.body.team == 'team_2') {
              notify = match.get('team_1_players');
            }
            notify = ('' + notify)
              .split('|')
              .filter(function(item) {
                if (item != '') {
                  return true;
                }
                return false;
              })
              .map(function(item) {
                return parseInt(item);
              });
            for (let i = 0; i < notify.length; i++) {
              new Notif()
                .save({
                  user_id: notify[i],
                  description: 'Other Team has requested to cancel the match',
                  type: 'match',
                  object_id: match.id
                })
                .then(function() {
                  //
                })
                .catch(function() {
                  //
                });
            }
            return res
              .status(200)
              .send({ok: true, msg: 'Match cancellation requested'});
          })
          .catch(function(err) {
            res
              .status(400)
              .send({ok: false, msg: 'Match cancellation Failed.'});
          });
      }

      //
    })
    .catch(function(err) {
      Raven.captureException(err);
      return res.status(400).send({
        ok: false,
        msg: 'Failed to fetch match'
      });
    });
};
