const routes = require('express').Router();

// const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');
const User = require('../../models/User');
const Game = require('../games/Game');
const Ladder = require('../games/Ladder');
// const Teams = require('../teams/Team');
const Models = require('./Models');
const Topic = require('../topics/Topic');
const Match = require('../matches/Match');
const Ticket = require('../tickets/Ticket');
const Threads = require('../threads/Thread');
const Money8 = require('../money8/Money8Match');
const Withdrawal = require('../../models/Withdrawal');
const Tournament = require('../tournaments/Tournament');
const TournamentMatch = require('../tournaments/TournamentMatch');
const Posts = require('../posts/Post');

const FormAdvertise = require('../../models/FormAdvertise');
const FormStaffApplication = require('../../models/FormStaffApplication');
const FormSubscribe = require('../../models/FormSubscribe');

const CashTransactions = require('../../models/CashTransactions');
const CreditTransactions = require('../../models/CreditTransactions');
const XPTransactions = require('../../models/XPTransactions');

module.exports = routes;

const fixateModel = function(req, res, next) {
  switch (req.params.model) {
    case 'users':
      req.Mdl = User;
      next();
      return;
    case 'games':
      req.Mdl = Game;
      next();
      return;
    case 'withdrawal':
      req.Mdl = Withdrawal;
      next();
      return;
    case 'ladders':
      req.Mdl = Ladder;
      next();
      return;
    case 'team_u':
      req.Mdl = Models.TeamUser2;
      next();
      return;
    case 'teams':
      req.Mdl = Models.Team2;
      next();
      return;
    case 'matches':
      req.Mdl = Match;
      next();
      return;
    case 'money8':
      req.Mdl = Money8;
      next();
      return;
    case 'topics':
      req.Mdl = Topic;
      next();
      return;
    case 'threads':
      req.Mdl = Threads;
      next();
      return;
    case 'tournament':
      req.Mdl = Tournament;
      next();
      return;
    case 'tickets':
      req.Mdl = Ticket;
      next();
      return;
    case 'cash':
      req.Mdl = CashTransactions;
      next();
      return;
    case 'credits':
      req.Mdl = CreditTransactions;
      next();
      return;
    case 'xp_tx':
      req.Mdl = XPTransactions;
      next();
      return;
    case 'posts':
      req.Mdl = Posts;
      next();
      return;

    case 'tournamentmaches':
      req.Mdl = TournamentMatch;
      next();
      return;

    case 'advertisers':
      req.Mdl = FormAdvertise;
      next();
      return;

    case 'staff_applications':
      req.Mdl = FormStaffApplication;
      next();
      return;

    case 'subscribers':
      req.Mdl = FormSubscribe;
      next();
      return;

    default:
      return res.status(400).send({ok: false, msg: 'Model not found'});
  }
};

routes.get('/listPaged/:model', fixateModel, ctrl.listPaged);
routes.post('/update/:model', fixateModel, ctrl.update);
routes.post('/delete/:model', fixateModel, ctrl.delete);
