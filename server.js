require('dotenv').config({silent: true});
const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');

// const request = require('request');
// ES6 Transpiler
require('@babel/register');
require('babel-polyfill');

// Models
const User = require('./models/User');
const Lang = require('./models/Lang');

// Controllers
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');
const planController = require('./controllers/plan');
const cmsPageController = require('./controllers/cmspage');
const submissionsController = require('./controllers/submissions');
const creditsController = require('./controllers/credits');
// const topicsController = require('./controllers/topics');

const faqController = require('./controllers/faq');
const langController = require('./controllers/language');
const settingsController = require('./controllers/settings');
const notifController = require('./controllers/notif');

const langs = {};

const app = express();
app.use(fileUpload());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 3000);
const IS_PROD = process.env.IS_PROD || 'no';
// const forceDomain = require('forcedomain');

if (IS_PROD == 'YES') {
  // app.use(forceDomain({
  //     hostname: 'www.thinkscademy.com',
  //     protocol: 'https'
  //   }));
}
app.use(compression());
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  req.isAuthenticated = function(type) {
    const token = req.headers.authorization
      ? req.headers.authorization && req.headers.authorization.split(' ')[1]
      : req.cookies.token
        ? req.cookies.token
        : '';
    // console.log(token);
    if (!token) {
      return false;
    }
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      // console.log(err);
      return false;
    }
  };

  if (req.isAuthenticated()) {
    const payload = req.isAuthenticated();
    new User({id: payload.sub}).fetch().then(function(user) {
      if (user) {
        req.user = user.toJSON();
      }

      next();
    });
  } else {
    next();
  }
});

app.post('/upload', (req, res, next) => {
  const mkdirp = require('mkdirp');
  const uploadFile = req.files.file;
  const fileName = req.files.file.name;
  const rand = Math.floor(Math.random() * 100000) + 1;

  const dt = '' + new Date().getFullYear() + '/' + new Date().getMonth() + '';

  mkdirp.sync(__dirname + '/public/files/' + dt);
  let final_path = fileName.replace(/ /g, '_');
  final_path = `/files/${dt}/f_${rand}_${final_path}`;
  uploadFile.mv(`${__dirname}/public${final_path}`, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.json({
      file: final_path
    });
  });
});

app.post('/contact', contactController.contactPost);
app.get('/me', userController.ensureAuthenticated, function(req, res, next) {
  // console.log()
  res.status(200).send({
    user: req.user,
    ok: true
  });
});

app.post('/upload', (req, res, next) => {
  const mkdirp = require('mkdirp');
  const uploadFile = req.files.file;
  const fileName = req.files.file.name;
  const rand = Math.floor(Math.random() * 100000) + 1;

  const dt = '' + new Date().getFullYear() + '/' + new Date().getMonth() + '';

  mkdirp.sync(__dirname + '/public/files/' + dt);

  uploadFile.mv(
    `${__dirname}/public/files/${dt}/f_${rand}_${fileName}`,
    function(err) {
      if (err) {
        return res.status(500).send(err);
      }

      res.json({
        file: `/files/${dt}/f_${rand}_${req.files.file.name}`
      });
    }
  );
});

app.put(
  '/account',
  userController.ensureAuthenticated,
  userController.accountPut
);

app.post(
  '/accountPics',
  userController.ensureAuthenticated,
  userController.accountPic
);
app.get('/api/user_info', userController.singleUser_info);

app.delete(
  '/account',
  userController.ensureAuthenticated,
  userController.accountDelete
);
//
// app.post(
//   '/api/submission/new',
//   userController.ensureAuthenticated,
//   submissionsController.newSubmission
// );
//
// app.get(
//   '/api/submission/my',
//   userController.ensureAuthenticated,
//   submissionsController.my
// );
app.post(
  '/api/credits/new',
  userController.ensureAuthenticated,
  creditsController.new
);

app.get('/langController', langController.importLang);
app.post('/signup', userController.signupPost);
app.get('/resend', userController.resend);
app.post('/login', userController.loginPost);
app.post('/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);
app.get('/activate/:id/:timestamp', userController.activateUser);
app.get(
  '/user/list',
  userController.ensureAuthenticated,
  userController.isAdmin,
  userController.listUsers
);
app.post(
  '/user/delete',
  userController.ensureAuthenticated,
  userController.isAdmin,
  userController.deleteUser
);
app.post(
  '/user/ban',
  userController.ensureAuthenticated,
  userController.isAdmin,
  userController.banUser
);
app.post(
  '/user/unban',
  userController.ensureAuthenticated,
  userController.isAdmin,
  userController.unbanUser
);
app.post(
  '/user/makeAdmin',
  userController.ensureAuthenticated,
  userController.isAdmin,
  userController.makeAdmin
);
app.get(
  '/unlink/:provider',
  userController.ensureAuthenticated,
  userController.unlink
);

app.get(
  '/api/invoices/all',
  userController.ensureAuthenticated,
  userController.isAdmin,
  submissionsController.allInvoices
);
app.get(
  '/api/invoices_of/:id',
  userController.ensureAuthenticated,
  userController.isAdmin,
  submissionsController.allInvoicesOf
);

app.get('/api/plan/list', planController.listPlan);
app.get('/api/plan/single/:id', planController.listSinglePlan);
app.post(
  '/api/plan/add',
  userController.ensureAuthenticated,
  userController.isAdmin,
  planController.addPlan
);
app.post(
  '/api/plan/edit',
  userController.ensureAuthenticated,
  userController.isAdmin,
  planController.updatePlan
);
app.post(
  '/api/plan/delete',
  userController.ensureAuthenticated,
  userController.isAdmin,
  planController.deletePlan
);

app.get('/api/faq/list', faqController.listFaq);
app.get('/api/faq/single/:id', faqController.listSingleFaq);
app.post(
  '/api/faq/add',
  userController.ensureAuthenticated,
  userController.isAdmin,
  faqController.addFaq
);
app.post(
  '/api/faq/edit',
  userController.ensureAuthenticated,
  userController.isAdmin,
  faqController.updateFaq
);
app.post(
  '/api/faq/delete',
  userController.ensureAuthenticated,
  userController.isAdmin,
  faqController.deleteFaq
);

const gamesRoutes = require('./routes/games/games.route.js');
app.use('/api/games', gamesRoutes);

const ladderRoutes = require('./routes/ladder/games.route.js');
app.use('/api/ladder', ladderRoutes);

const teamsRoutes = require('./routes/teams/team.route');
app.use('/api/teams', teamsRoutes);

const matchRoute = require('./routes/matches/match.route');
app.use('/api/matches', matchRoute);

const tournamentsRoutes = require('./routes/tournaments/tournaments.route.js');
app.use('/api/tournaments', tournamentsRoutes);

const topicRoutes = require('./routes/topics/topic.route.js');
app.use('/api/topic', topicRoutes);

const threadRoutes = require('./routes/threads/thread.route.js');
app.use('/api/thread', threadRoutes);

const thread_repliesRoutes = require('./routes/ThreadReplies/threadreply.route.js');
app.use('/api/thread_replies', thread_repliesRoutes);

const ticketsRoutes = require('./routes/tickets/ticket.route.js');
app.use('/api/tickets', ticketsRoutes);

const ticket_repliesRoutes = require('./routes/TicketReplies/ticketreply.route.js');
app.use('/api/ticket_replies', ticket_repliesRoutes);

const posts_route = require('./routes/posts/post.route.js');
app.use('/api/posts', posts_route);

app.get(
  '/api/cms_pages/list',
  userController.ensureAuthenticated,
  userController.isAdmin,
  cmsPageController.listCMSPage
);
app.get(
  '/api/cms_pages/single/:id',
  userController.ensureAuthenticated,
  userController.isAdmin,
  cmsPageController.listSingleCMSPage
);
app.get('/api/cms_pages/slug/:slug', cmsPageController.listSingleCMSPageSlug);
app.post(
  '/api/cms_pages/add',
  userController.ensureAuthenticated,
  userController.isAdmin,
  cmsPageController.addCMSPage
);
app.post(
  '/api/cms_pages/edit',
  userController.isAdmin,
  userController.ensureAuthenticated,
  cmsPageController.updateCMSPage
);
app.post(
  '/api/cms_pages/delete',
  userController.ensureAuthenticated,
  userController.isAdmin,
  cmsPageController.deleteCMSPage
);

app.get(
  '/api/lang/list',
  userController.ensureAuthenticated,
  userController.isAdmin,
  langController.listLang
);
app.get(
  '/api/lang/single/:id',
  userController.ensureAuthenticated,
  userController.isAdmin,
  langController.listSingleLang
);
app.post(
  '/api/lang/edit',
  userController.ensureAuthenticated,
  userController.isAdmin,
  langController.updateLang
);

app.get(
  '/notifs/list',
  userController.ensureAuthenticated,
  notifController.list
);
app.post(
  '/notifs/delete',
  userController.ensureAuthenticated,
  notifController.delete
);

app.get(
  '/settings/list',
  userController.ensureAuthenticated,
  userController.isAdmin,
  settingsController.listSettings
);
app.get(
  '/settings/list/default',
  userController.ensureAuthenticated,
  userController.isAdmin,
  settingsController.listSettingsDefault
);
app.get(
  '/settings/single/:id',
  userController.ensureAuthenticated,
  userController.isAdmin,
  settingsController.listSingleSettings
);
app.post(
  '/settings/edit',
  userController.ensureAuthenticated,
  userController.isAdmin,
  settingsController.updateSettings
);
// app.post(
//   '/settings/edit/file',
//   userController.ensureAuthenticated,
//   uploadIMG.single('file'),
//   settingsController.updateSettingsFile
// );
app.get('/init_settings', settingsController.create_SATOSHIS);

app.use('/admin_panel/', express.static(path.join(__dirname, 'admin')));
app.get('/admin_panel/*', function(req, res) {
  res.sendFile(path.join(__dirname, './admin', 'index.html'));
});

new Lang().fetchAll().then(function(data) {
  if (data) {
    data = data.toJSON();
    for (let i = 0; i < data.length; i++) {
      langs[data[i].key] = [data[i].l_1, data[i].l_2];
    }
  }
});

app.get('/api/lang/', function(req, res, next) {
  // console.log(langs);
  res.status(200).send(langs);
});

app.get('/clearTranslationCache', function(req, res, next) {
  new Lang().fetchAll().then(function(data) {
    if (data) {
      data = data.toJSON();
      for (let i = 0; i < data.length; i++) {
        langs[data[i].key] = [data[i].l_1, data[i].l_2];
      }
    } else {
      // console.log('no data');
    }
    res.status(302).redirect('/admin_panel');
  });
});
app.get('/api/*', function(req, res, next) {
  res.status(404).send({ok: false, route: '404', msg: 'Route not found'});
});
app.post('/api/*', function(req, res, next) {
  res.status(404).send({ok: false, route: '404', msg: 'Route not found'});
});
const renderReact = require('./renderReact.js');
renderReact(app, langs);

// if (app.get('env') === 'production') {
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.sendStatus(err.status || 500);
});
// }

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
