const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.post('/newMsg', u_ctrl.ensureAuthenticated, ctrl.new);
routes.get('/list', ctrl.list);
// routes.get(
//   '/group_has_unread',
//   u_ctrl.ensureAuthenticated,
//   ctrl.groupHasUnread
// );
// routes.get('/chatFor', u_ctrl.ensureAuthenticated, ctrl.chatFor);
// routes.post('/newMsg', u_ctrl.ensureAuthenticated, ctrl.newMsg);
// routes.get(
//   '/all_groups',
//   u_ctrl.ensureAuthenticated,
//   u_ctrl.isAdmin,
//   ctrl.allGroups
// );
//
// routes.get(
//   '/all_msgs',
//   u_ctrl.ensureAuthenticated,
//   u_ctrl.isAdmin,
//   ctrl.allMsgs
// );
