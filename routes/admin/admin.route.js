const routes = require('express').Router();

const u_ctrl = require('../../controllers/user');
const ctrl = require('./controller.js');
const User = require('../../models/User');
const Game = require('../games/Game');
const Ladder = require('../games/Ladder');
// const Teams = require('../teams/Team');
const Models = require('./Models');
const Topic =require('../topics/Topic')
const Match = require('../matches/Match');
const Ticket = require('../tickets/Ticket');
const Threads = require('../threads/Thread');
const Money8 = require('../money8/Money8Match');
const Tournament = require('../tournaments/Tournament')
module.exports = routes;


const fixateModel = function(req, res, next)
{
	switch(req.params.model){
		case 'users': 
			req.Mdl = User;
			next();
			return;
		case 'games': 
			req.Mdl = Game;
			next();
			return;
		case 'ladders': 
			req.Mdl = Ladder;
			next();
			return;
		case 'team_u': 
			req.Mdl = Models.TeamUser2;
			next();
			return;
		case 'teams': 
			req.Mdl = Models.Team2;
			next();
			return;
		case 'matches': 
			req.Mdl = Match;
			next();
			return;
		case 'money8': 
			req.Mdl = Money8;
			next();
			return;
		case 'topics': 
			req.Mdl = Topic;
			next();
			return;
		case 'threads': 
			req.Mdl = Threads;
			next();
			return;
		case 'tournament' : 
			req.Mdl = Tournament;
			next();
			return;
		case 'tickets':
			req.Mdl = Ticket;
			next();
			return;
	}
	res.status(400).send({ok:false, msg : 'Model not found' });
}

routes.get('/listPaged/:model',  fixateModel, ctrl.listPaged);
routes.post('/update/:model',  fixateModel, ctrl.update);
routes.post('/delete/:model',  fixateModel, ctrl.delete);



// routes.get('/single/:model/:id', fixateModel, ctrl.listSingleGame);
// routes.post('/:model/add', u_ctrl.ensureAuthenticated, fixateModel, ctrl.addGame);
// routes.post('/edit', u_ctrl.ensureAuthenticated, ctrl.updateGame);
// routes.post('/:model/delete', u_ctrl.ensureAuthenticated,  fixateModel,ctrl.deleteGame);
