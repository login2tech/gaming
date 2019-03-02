const routes = require('express').Router();

var u_ctrl = require('../../controllers/user');
var ctrl = require('./controller.js');


var confirmIfAllowed= function(req, res, next)
{
  if (req.user.role == 'teacher' || req.user.role == 'admin') {
    next();
  } else {
    res.status(400).send({ ok: false, msg: 'Unauthorized' });
  }
}

module.exports = routes;

routes.get('/list/:courseId', u_ctrl.ensureAuthenticated, ctrl.list);
routes.get('/single/:id', u_ctrl.ensureAuthenticated, ctrl.single);
routes.get('/single_results/:id', u_ctrl.ensureAuthenticated, ctrl.quizResults);

routes.post('/add', u_ctrl.ensureAuthenticated, confirmIfAllowed, ctrl.add);
routes.post('/edit', u_ctrl.ensureAuthenticated, confirmIfAllowed, ctrl.update);
routes.post('/delete', u_ctrl.ensureAuthenticated, confirmIfAllowed, ctrl.delete);
