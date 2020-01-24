import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Router, browserHistory} from 'react-router';
import configureStore from './store/configureStore';
import getRoutes from './routes';
import {LocalizeProvider} from 'react-localize-redux';
const store = configureStore(window.INITIAL_STATE);

ReactDOM.hydrate(
  <Provider store={store}>
    <LocalizeProvider store={store}>
      <Router
        history={browserHistory}
        routes={getRoutes(store)}
        onUpdate={() => window.scrollTo(0, 0)}
      />
    </LocalizeProvider>
  </Provider>,
  document.getElementById('app')
);
