const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list', ctrl.listItem);
//routes.get('/team_of_user', ctrl.team_of_user);
// routes.post('/invite', u_ctrl.ensureAuthenticated, ctrl.invite);
routes.post('/join', u_ctrl.ensureAuthenticated, ctrl.join);
routes.post('/saveScore', u_ctrl.ensureAuthenticated, ctrl.saveScore);

routes.get(
  '/matches_of_user',
  u_ctrl.ensureAuthenticated,
  ctrl.matches_of_user
);

routes.get(
  '/matches_of_team',
  u_ctrl.ensureAuthenticated,
  ctrl.matches_of_team
);

routes.post('/leave_match', ctrl.leave_match);
// routes.post('/approve', u_ctrl.ensureAuthenticated, ctrl.approve);
routes.get('/user_info', ctrl.listItem);
// routes.get('/listPaged', ctrl.listPaged);
routes.get('/single/:id', ctrl.listSingleItem);
routes.get('/upcoming', ctrl.listupcoming);
routes.get('/recent', ctrl.listrecent);

routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addItem);
routes.post(
  '/resolveDispute',
  u_ctrl.ensureAuthenticated,
  ctrl.resolveDisputeWrap
);
