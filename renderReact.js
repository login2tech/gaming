const React = require('react');
const ReactDOM = require('react-dom/server');
const Router = require('react-router');

const Provider = require('react-redux').Provider;
// import {LocalizeProvider} from 'react-localize-redux';
const LocalizeProvider = require('react-localize-redux').LocalizeProvider;
const routes = require('./app/routes');
const configureStore = require('./app/store/configureStore').default;
const Settings = require('./models/Settings');
module.exports = function(app, langs) {
  app.use(
    function(req, res, next) {
      new Settings()
        .fetchAll()
        .then(function(settings) {
          if (settings) {
            settings = settings.toJSON();
          }

          req.pg_settings = {};

          for (let i = 0; i < settings.length; i++) {
            req.pg_settings[settings[i].key] = settings[i].content;
          }
          next();
        })
        .catch(function(err) {
          console.log(err);
          next();
        });
    },
    function(req, res, next) {
      const initialState = {
        auth: {token: req.cookies.token, user: req.user},
        messages: {},
        settings: req.pg_settings
        // language: langs,
        // cur_lang : req.cookies.cur_lang ? req.cookies.cur_lang : 'l_1'
      };

      const store = configureStore(initialState);

      Router.match({routes: routes.default(store), location: req.url}, function(
        err,
        redirectLocation,
        renderProps
      ) {
        if (err) {
          res.status(500).send(err.message);
        } else if (redirectLocation) {
          res
            .status(302)
            .redirect(redirectLocation.pathname + redirectLocation.search);
        } else if (renderProps) {
          // console.log(renderProps);
          // console.log(React.createElement(Router.RouterContext, renderProps));

          const html = ReactDOM.renderToString(
            React.createElement(
              Provider,
              {store: store},
              <LocalizeProvider
                initialize={{
                  languages: [
                    {name: 'English', code: 'en'},
                    {name: 'French', code: 'fr'}
                  ],
                  translation: langs,
                  options: {
                    defaultLanguage: 'en',
                    renderToStaticMarkup: ReactDOM.renderToStaticMarkup
                  }
                }}
              >
                {React.createElement(Router.RouterContext, renderProps)}
              </LocalizeProvider>
            )
          );
          res.render('layout', {
            html: html,
            initialState: store.getState()
          });
        } else {
          res.sendStatus(404);
        }
      });
    }
  );
};
