const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./category_controller.js');

module.exports = routes;

routes.get('/list', ctrl.listCategory);
routes.get('/single/:id', ctrl.listSingleCategory);
routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addCategory);
routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateCategory);
routes.post('/delete', u_ctrl.ensureAuthenticated, ctrl.deleteCategory);
