const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list', ctrl.listItem);
routes.get('/team_of_user', ctrl.team_of_user);
routes.post('/invite', u_ctrl.ensureAuthenticated, ctrl.invite);
routes.post('/approve', u_ctrl.ensureAuthenticated, ctrl.approve);
routes.get('/user_info', ctrl.listItem);
// routes.get('/listPaged', ctrl.listPaged);
routes.get('/single/:id', ctrl.listSingleItem);
routes.get('/my_invites', u_ctrl.ensureAuthenticated, ctrl.listMyInvites);

routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addItem);
// routes.get('/matchlist', u_ctrl.ensureAuthenticated, ctrl.matchlist);

routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateItem);
routes.post('/delete', u_ctrl.ensureAuthenticated, ctrl.deleteItem);

routes.post('/pics', u_ctrl.ensureAuthenticated, ctrl.team_pic);

routes.post('/removeMembers', u_ctrl.ensureAuthenticated, ctrl.removeMembers);
routes.post('/disband', u_ctrl.ensureAuthenticated, ctrl.disband);
routes.post('/changeName', u_ctrl.ensureAuthenticated, ctrl.changeName);
