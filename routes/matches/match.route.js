const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list', ctrl.listItem);
//routes.get('/team_of_user', ctrl.team_of_user);
routes.post('/invite', u_ctrl.ensureAuthenticated, ctrl.invite);
routes.post('/approve', u_ctrl.ensureAuthenticated, ctrl.approve);
routes.get('/user_info', ctrl.listItem);
// routes.get('/listPaged', ctrl.listPaged);
routes.get('/single/:id', ctrl.listSingleItem);
routes.get('/upcoming', ctrl.listupcoming);

routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addItem);
