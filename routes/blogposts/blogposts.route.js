const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list', ctrl.listBlogPost);
routes.get('/listPaged', ctrl.listPaged);
routes.get('/single/:id', ctrl.listSingleBlogPost);
routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addBlogPost);
routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateBlogPost);
routes.post('/delete', u_ctrl.ensureAuthenticated, ctrl.deleteBlogPost);
