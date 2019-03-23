const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list/my', ctrl.listItemMy);
routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addItem);
// routes.get('/listPaged', ctrl.listPaged);
// routes.get('/single/:id', ctrl.listSingleItem);

// routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateItem);
// routes.post('/delete', u_ctrl.ensureAuthenticated, ctrl.deleteItem);
