import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Router, browserHistory} from 'react-router';
import configureStore from './store/configureStore';
import getRoutes from './routes';
import {LocalizeProvider} from 'react-localize-redux';
const store = configureStore(window.INITIAL_STATE);

ReactDOM.render(
  <Provider store={store}>
    <LocalizeProvider store={store}>
      <Router history={browserHistory} routes={getRoutes(store)} />
    </LocalizeProvider>
  </Provider>,
  document.getElementById('app')
);
