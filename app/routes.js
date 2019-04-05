import React from 'react';
import {IndexRoute, Route} from 'react-router';
import App from './components/App';

import Home from './components/Pages/Home';
import Contact from './components/Pages/Contact';
import NotFound from './components/Pages/NotFound';
import FAQ from './components/Pages/FAQ';

import CMSPage from './components/CMSPage';
import Login from './components/Account/Login';
import Signup from './components/Account/Signup';
import Profile from './components/Account/Profile';
import Dashboard from './components/Account/Dashboard';
import Forgot from './components/Account/Forgot';
import Reset from './components/Account/Reset';

import Topics from './components/Forums/Topic';
import Threads from './components/Forums/Threads';
import SingleThread from './components/Forums/SingleThread';

import NewTeam from './components/Teams/NewTeam';
import TeamInfo from './components/Teams/TeamInfo';

import NewTicket from './components/Tickets/NewTicket';
import SingleTicket from './components/Tickets/SingleTicket';
import Tickets from './components/Tickets/MyTickets';

import NewMatch from './components/Match/NewMatch';
import MatchFinder from './components/Match/MatchFinder';
import MatchInfo from './components/Match/MatchInfo';

import TournamentFinder from './components/Tournament/TournamentFinder';
import TournamentInfo from './components/Tournament/TournamentInfo';

import Shop from './components/Shop/Shop';

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
      <Route path="/p/:slug" component={CMSPage} />
      <Route
        path="/support/tickets/ticket/:ticket_id"
        onEnter={ensureAuthenticated}
        component={SingleTicket}
      />
      <Route
        path="/support/tickets/create"
        onEnter={ensureAuthenticated}
        component={NewTicket}
      />
      <Route
        path="/support/tickets"
        onEnter={ensureAuthenticated}
        component={Tickets}
      />
      <Route
        path="/forums/thread/:thread_id/page/:page"
        component={props => <SingleThread key={props.params.page} {...props} />}
      />
      />
      <Route path="/forums/:id/:title" component={Threads} />
      <Route path="/forums" component={Topics} />
      <Route path="/matchfinder" component={MatchFinder} />
      <Route path="/tournaments" component={TournamentFinder} />
      <Route path="/t/:tournament_id" component={TournamentInfo} />
      <Route path="/m/:match_id" component={MatchInfo} />
      <Route
        path="/matchfinder/new/:ladder/:id"
        component={NewMatch}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/u/:username/teams/new"
        component={NewTeam}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/u/:username/teams/:team_id"
        component={TeamInfo}
        onLeave={clearMessages}
      />
      <Route
        path="/teams/view/:team_id"
        component={TeamInfo}
        onLeave={clearMessages}
      />
      <Route path="/u/:username" component={Profile} onLeave={clearMessages} />
      <Route path="/shop" component={Shop} onLeave={clearMessages} />
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
        path="/dashboard"
        component={Dashboard}
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
