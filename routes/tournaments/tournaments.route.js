const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list', ctrl.listItem);
routes.get('/listPaged', ctrl.listPaged);
routes.get('/single/:id', ctrl.listSingleItem);
routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addItem);
routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateItem);
routes.post('/delete', u_ctrl.ensureAuthenticated, ctrl.deleteItem);
routes.get('/upcoming', ctrl.listupcoming);
routes.post('/join', u_ctrl.ensureAuthenticated, ctrl.join);


routes.get('/t_of_user', ctrl.t_of_user);
routes.post('/saveScore', u_ctrl.ensureAuthenticated, ctrl.saveScore);