const routes = require('express').Router();
const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list', ctrl.listItem);
routes.post('/join', u_ctrl.ensureAuthenticated, ctrl.join);
routes.post('/leave', u_ctrl.ensureAuthenticated, ctrl.leave);
routes.post('/saveScore', u_ctrl.ensureAuthenticated, ctrl.saveScore);
routes.get('/user_info', ctrl.listItem);
routes.get('/single/:id', ctrl.listSingleItem);
routes.get('/upcoming', ctrl.listupcoming);
routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addItem);
routes.post(
  '/resolveDispute',
  u_ctrl.ensureAuthenticated,
  ctrl.resolveDisputeWrap
);
routes.get('/matches_of_user', ctrl.matchesForUser);
