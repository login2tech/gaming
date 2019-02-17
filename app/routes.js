import React from 'react';
import {IndexRoute, Route} from 'react-router';
import App from './components/App';

import Home from './components/Pages/Home';
import Contact from './components/Pages/Contact';
import NotFound from './components/Pages/NotFound';
import FAQ from './components/Pages/FAQ';

import CMSPage from './components/CMSPage';
import Order from './components/Pages/Order';
import Vote from './components/Pages/Vote';
import Results from './components/Pages/Results';

import Login from './components/Account/Login';
import Signup from './components/Account/Signup';
import Posts from './components/Blog/Posts';
import SinglePost from './components/Blog/SinglePost';
import Profile from './components/Account/Profile';
import Forgot from './components/Account/Forgot';
import Reset from './components/Account/Reset';

export default function getRoutes(store) {
  const ensureAuthenticated = (nextState, replace) => {
    if (!store.getState().auth.token) {
      replace('/login');
    }
  };
  const skipIfAuthenticated = (nextState, replace) => {
    if (store.getState().auth.token) {
      replace('/');
    }
  };
  const clearMessages = () => {
    store.dispatch({
      type: 'CLEAR_MESSAGES'
    });
  };
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} onLeave={clearMessages} />
      <Route path="/contact" component={Contact} onLeave={clearMessages} />
      <Route path="/faq" component={FAQ} onLeave={clearMessages} />
      <Route path="/order" component={Order} onLeave={clearMessages} />
      <Route
        path="/vote"
        component={Vote}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/result"
        component={Results}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />

      <Route
        path="/blog/post/:id/:slug"
        component={SinglePost}
        onLeave={clearMessages}
      />
      <Route
        path="/blog/post/:id"
        component={SinglePost}
        onLeave={clearMessages}
      />

      <Route path="/blog/p/:paged" component={Posts} />
      <Route path="/blog" component={Posts} />
      <Route path="/p/:slug" component={CMSPage} />

      <Route
        path="/login"
        component={Login}
        onEnter={skipIfAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/signup"
        component={Signup}
        onEnter={skipIfAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/account"
        component={Profile}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />

      <Route
        path="/forgot"
        component={Forgot}
        onEnter={skipIfAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/reset/:token"
        component={Reset}
        onEnter={skipIfAuthenticated}
        onLeave={clearMessages}
      />
      <Route path="*" component={NotFound} onLeave={clearMessages} />
    </Route>
  );
}
