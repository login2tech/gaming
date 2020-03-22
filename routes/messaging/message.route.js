const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.post('/newMsg', u_ctrl.ensureAuthenticated, ctrl.new);
routes.get('/list', ctrl.list);
