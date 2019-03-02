const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list', ctrl.listGame);
routes.get('/listPaged', ctrl.listPaged);
routes.get('/single/:id', ctrl.listSingleGame);
routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addGame);
routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateGame);
routes.post('/delete', u_ctrl.ensureAuthenticated, ctrl.deleteGame);
