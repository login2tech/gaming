import React from 'react';
import {IndexRoute, Route} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Login from './components/Account/Login';
import Signup from './components/Account/Signup';
import Profile from './components/Account/Profile';
import Forgot from './components/Account/Forgot';
import Reset from './components/Account/Reset';

import AdminUsers from './components/DataRows/AdminUsers';
import AppUsers from './components/DataRows/AppUsers';
import Teams from './components/DataRows/Teams';

import Matchfinder from './components/DataRows/Matchfinder';
import Money8 from './components/DataRows/Money8';
import Tournaments from './components/DataRows/Tournaments';
import Games from './components/DataRows/Games';
import FAQ from './components/DataRows/FAQ';
import Ladders from './components/DataRows/Ladders';
import Topics from './components/DataRows/Topics';
import Posts from './components/DataRows/Posts';
import Threads from './components/DataRows/Threads';
import Tickets from './components/DataRows/Tickets';
import TicketsClosed from './components/DataRows/TicketsClosed';
import Subscribers from './components/DataRows/Subscribers';
import ApplyStaff from './components/DataRows/ApplyStaff';
import AdvertiseWithUs from './components/DataRows/AdvertiseWithUs';
import TournamentMatches from './components/DataRows/TournamentMatches';

import WithdrawalCompleted from './components/DataRows/WithdrawalCompleted';
import WithdrawalPending from './components/DataRows/WithdrawalPending';
import Settings from './components/DataRows/Settings';

export default function getRoutes(store) {
  const ensureAuthenticated = (nextState, replace) => {
    // if (!store.getState().auth.token) {
    //   replace('/login');
    // }
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
      <Route
        path="/account"
        component={Profile}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/forms/advertise_with_us"
        component={AdvertiseWithUs}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/forms/apply_for_staff"
        component={ApplyStaff}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/forms/subscribers"
        component={Subscribers}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/settings"
        component={Settings}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />

      <Route
        path="/withdrawal/pending"
        component={WithdrawalPending}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/withdrawal/completed"
        component={WithdrawalCompleted}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/admin_users"
        component={AdminUsers}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/app_users"
        component={AppUsers}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/faq"
        component={FAQ}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/teams/:uid"
        component={Teams}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/teams"
        component={Teams}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />

      <Route
        path="/teams/filter/:lid/:ltitle"
        component={Teams}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />

      <Route
        path="/matchfinder/:team_id"
        component={Matchfinder}
        onLeave={clearMessages}
      />
      <Route
        path="/matchfinder/filter/:status"
        component={Matchfinder}
        onLeave={clearMessages}
      />
      <Route
        path="/matchfinder"
        component={Matchfinder}
        onLeave={clearMessages}
      />

      <Route
        path="/money8/filter/:status"
        component={Money8}
        onLeave={clearMessages}
      />
      <Route
        path="/tournamentmatches/filter/:status"
        component={TournamentMatches}
        onLeave={clearMessages}
      />
      <Route path="/money8" component={Money8} onLeave={clearMessages} />
      <Route
        path="/tournaments"
        component={Tournaments}
        onLeave={clearMessages}
      />
      <Route path="/games" component={Games} onLeave={clearMessages} />
      <Route path="/topics" component={Topics} onLeave={clearMessages} />
      <Route path="/threads" component={Threads} onLeave={clearMessages} />
      <Route path="/tickets" component={Tickets} onLeave={clearMessages} />
      <Route
        path="/tickets_closed"
        component={TicketsClosed}
        onLeave={clearMessages}
      />

      <Route path="/posts" component={Posts} onLeave={clearMessages} />
      <Route path="/games/add" component={Games} onLeave={clearMessages} />
      <Route path="/games/edit" component={Games} onLeave={clearMessages} />
      <Route path="/ladders" component={Ladders} onLeave={clearMessages} />
      <Route path="/ladders/add" component={Ladders} onLeave={clearMessages} />
      <Route path="/ladders/edit" component={Ladders} onLeave={clearMessages} />

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
