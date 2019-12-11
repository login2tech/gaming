import React from 'react';
import {IndexRoute, Route} from 'react-router';
import App from './components/App';

import Home from './components/Pages/Home';
import Contact from './components/Pages/Contact';
import ApplyForStaff from './components/Pages/ApplyForStaff';
import AdvertiseWithUs from './components/Pages/AdvertiseWithUs';
import NotFound from './components/Pages/NotFound';
import FAQ from './components/Pages/FAQ';

import CMSPage from './components/CMSPage';
import Notifications from './components/Notifications';
import Records from './components/Account/Records';
import MyTeams from './components/Account/MyTeams';
import MyBank from './components/Account/MyBank';
import Transactions from './components/Transactions';
import Login from './components/Account/Login';
import Signup from './components/Account/Signup';
import Profile from './components/Account/Profile';
import Timeline from './components/Account/Timeline';
import SinglePost from './components/Social/SinglePost';
import Dashboard from './components/Account/Dashboard';
import Forgot from './components/Account/Forgot';
import Reset from './components/Account/Reset';
import Game from './components/Game';
import Leaderboards from './components/Leaderboards';

import Topics from './components/Forums/Topic';
import Threads from './components/Forums/Threads';
import NewThread from './components/Forums/NewThread';
import SingleThread from './components/Forums/SingleThread';

import NewTeam from './components/Teams/NewTeam';
import TeamInfo from './components/Teams/TeamInfo';
import Trophies from './components/Account/Trophies';

import FeedMy from './components/Social/FeedMy';
import Feed from './components/Social/Feed';

import ClipOfTheWeek from './components/Social/ClipOfTheWeek';

import NewTicket from './components/Tickets/NewTicket';
import SingleTicket from './components/Tickets/SingleTicket';
import Tickets from './components/Tickets/MyTickets';

import NewMatch from './components/Match/NewMatch';
import NewMatchTeamSelect from './components/Match/NewMatchTeamSelect';
import MatchFinder from './components/Match/MatchFinder';
import MatchInfo from './components/Match/MatchInfo';

import NewMoney8 from './components/Money8/NewMoney8';
import Money8List from './components/Money8/Money8List';
import Money8Info from './components/Money8/Money8Info';

import TournamentFinder from './components/Tournament/TournamentFinder';
import TournamentInfo from './components/Tournament/TournamentInfo';
import TeamInvites from './components/Pages/TeamInvites';
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
      <Route
        onEnter={ensureAuthenticated}
        path="/team_invites"
        component={TeamInvites}
        onLeave={clearMessages}
      />
      <Route
        path="/apply-for-staff"
        component={ApplyForStaff}
        onLeave={clearMessages}
      />
      <Route
        path="/advertise-with-us"
        component={AdvertiseWithUs}
        onLeave={clearMessages}
      />
      <Route onLeave={clearMessages} path="/faq" component={FAQ} />
      <Route onLeave={clearMessages} path="/p/:slug" component={CMSPage} />
      <Route
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
        path="/notifications"
        component={Notifications}
      />
      <Route
        onLeave={clearMessages}
        path="/records/:username/:duration"
        component={Records}
      />
      <Route
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
        path="/my_teams"
        component={MyTeams}
      />
      <Route
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
        path="/my_bank"
        component={MyBank}
      />

      <Route path="/leaderboards" component={Leaderboards} />
      <Route
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
        path="/transactions"
        component={Transactions}
      />
      <Route
        path="/support/tickets/ticket/:ticket_id"
        onLeave={clearMessages}
        onEnter={ensureAuthenticated}
        component={SingleTicket}
      />
      <Route
        onLeave={clearMessages}
        path="/feed/my"
        onEnter={ensureAuthenticated}
        component={FeedMy}
      />
      <Route
        onLeave={clearMessages}
        path="/post/:id"
        onEnter={ensureAuthenticated}
        component={SinglePost}
      />
      <Route
        onLeave={clearMessages}
        path="/clip_of_the_week_month"
        component={ClipOfTheWeek}
      />
      <Route
        onLeave={clearMessages}
        path="/feed/hashtag/:hashtag"
        component={Feed}
      />
      <Route
        onLeave={clearMessages}
        path="/u/:username/trophies/:type"
        component={Trophies}
      />
      <Route onLeave={clearMessages} path="/feed" component={Feed} />
      <Route
        path="/support/tickets/create/:mtype/:type/:mid/:ttile"
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
        component={NewTicket}
      />
      <Route
        path="/support/tickets/create"
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
        component={NewTicket}
      />
      <Route
        path="/support/tickets"
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
        component={Tickets}
      />
      <Route
        path="/forums/thread/:thread_id/page/:page"
        onLeave={clearMessages}
        component={props => <SingleThread key={props.params.page} {...props} />}
      />
      <Route
        onLeave={clearMessages}
        path="/forums/:id/:title"
        component={Threads}
      />
      <Route
        onLeave={clearMessages}
        path="/forums/:id/:title/new"
        component={NewThread}
      />
      <Route onLeave={clearMessages} path="/forums" component={Topics} />
      <Route
        onLeave={clearMessages}
        path="/matchfinder/:id/:title"
        component={MatchFinder}
      />
      <Route
        path="/matchfinder/new/:ladder/:id"
        component={NewMatch}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        path="/match/new"
        component={NewMatchTeamSelect}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route onLeave={clearMessages} path="/game/:id/:title" component={Game} />
      <Route
        onLeave={clearMessages}
        path="/matchfinder"
        component={MatchFinder}
      />
      <Route
        onLeave={clearMessages}
        path="/tournaments"
        component={TournamentFinder}
      />
      <Route
        onLeave={clearMessages}
        path="/t/:tournament_id"
        component={TournamentInfo}
      />
      <Route
        onLeave={clearMessages}
        path="/m/:match_id"
        component={MatchInfo}
      />
      <Route
        path="/mix-and-match/new/"
        component={NewMoney8}
        onEnter={ensureAuthenticated}
        onLeave={clearMessages}
      />
      <Route
        onLeave={clearMessages}
        path="/mix-and-match/:match_id"
        component={Money8Info}
      />
      <Route
        onLeave={clearMessages}
        path="/mix-and-match"
        component={Money8List}
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
      <Route
        path="/u/:username/timeline"
        component={Timeline}
        onLeave={clearMessages}
      />
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
