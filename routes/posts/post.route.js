const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');

module.exports = routes;

routes.get('/list/my', ctrl.listItemMy);
routes.get(
  '/list/myfeed',
  u_ctrl.ensureAuthenticated,
  ctrl.getMyFollowing,
  ctrl.listItemMyFeed
);
routes.get(
  '/latestTimestamp',
  u_ctrl.ensureAuthenticated,
  ctrl.getMyFollowingIfRequired,
  ctrl.hasNewPosts
);
routes.post('/doMakeFeatured', ctrl.doMakeFeatured)
routes.get('/list/all', ctrl.listItemAll);
routes.post('/add', u_ctrl.ensureAuthenticated, ctrl.addItem);
routes.post('/doPin', u_ctrl.ensureAuthenticated, ctrl.doPin);
routes.get('/reactionsList', u_ctrl.ensureAuthenticated, ctrl.reactionsList);

routes.post('/upvote', u_ctrl.ensureAuthenticated, ctrl.upvote);
routes.post('/new_comment', u_ctrl.ensureAuthenticated, ctrl.new_comment);
routes.post('/downvote', u_ctrl.ensureAuthenticated, ctrl.downvote);

routes.get('/famous', ctrl.famousWeek, ctrl.famousMonth);
// ctrl.famousDay, 
// routes.get('/listPaged', ctrl.listPaged);
routes.get('/single/:id', ctrl.listSingleItem);

// routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateItem);
routes.post('/delete', u_ctrl.ensureAuthenticated, ctrl.deleteItem);
