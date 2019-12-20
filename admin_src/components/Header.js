import React from 'react';
import {IndexLink, Link} from 'react-router';
import {connect} from 'react-redux';
import {logout} from '../actions/auth';

class Header extends React.Component {
  handleLogout(event) {
    event.preventDefault();
    this.props.dispatch(logout());
  }

  render() {
    const active = {borderBottomColor: '#3f51b5'};
    const rightNav = this.props.token ? (
      <ul className="nav navbar-nav navbar-right">
        <li className="dropdown">
          <a
            href="/"
            // data-toggle="dropdown"
            // className=" "
          >
            back to site
          </a>
        </li>
        <li className="dropdown">
          <a
            href="#"
            data-toggle="dropdown"
            className="navbar-avatar dropdown-toggle"
          >
            <img src={this.props.user.picture || this.props.user.gravatar} />{' '}
            {this.props.user.name ||
              this.props.user.first_name ||
              this.props.user.email ||
              this.props.user.id}{' '}
            <i className="caret" />
          </a>
          <ul className="dropdown-menu">
            <li>
              <Link to="/account">My Account</Link>
            </li>
            <li className="divider" />
            <li>
              <a href="#" onClick={this.handleLogout.bind(this)}>
                Logout
              </a>
            </li>
          </ul>
        </li>
      </ul>
    ) : (
      <ul className="nav navbar-nav navbar-right">
        <li>
          <Link to="/login" activeStyle={active}>
            Log in
          </Link>
        </li>
        <li>
          <a href="/signup">Sign up</a>
        </li>
      </ul>
    );
    return (
      <nav className="navbar navbar-default navbar-static-top">
        <div className="container">
          <div className="navbar-header">
            <button
              type="button"
              data-toggle="collapse"
              data-target="#navbar"
              className="navbar-toggle collapsed"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>
            <IndexLink to="/" className="navbar-brand">
              OCG
            </IndexLink>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            {this.props.user ? (
              <ul className="nav navbar-nav">
                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Users
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/admin_users">Admin Users</Link>
                    </li>
                    <li>
                      <Link to="/app_users">Web App User</Link>
                    </li>
                    <li>
                      <a
                        onClick={e => {
                          window.location.href = '/admin/#/teams';
                          window.location.reload();
                        }}
                        href="/admin/#/teams"
                        activeStyle={active}
                      >
                        Teams
                      </a>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Matches
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        href="/admin/#/matchfinder"
                        onClick={e => {
                          window.location.href = '/admin/#/matchfinder';
                          window.location.reload();
                        }}
                      >
                        MatchFinder
                      </a>
                    </li>
                    <li>
                      <a
                        href="/admin/#/money8"
                        onClick={e => {
                          window.location.href = '/admin/#/money8';
                          window.location.reload();
                        }}
                      >
                        Money 8
                      </a>
                    </li>
                    <li>
                      <a
                        href="/admin/#/tournaments"
                        onClick={e => {
                          window.location.href = '/admin/#/tournaments';
                          window.location.reload();
                        }}
                      >
                        Tournaments
                      </a>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Games & Ladders
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/games">List Games</Link>
                    </li>
                    <li>
                      <Link to="/ladders">List Ladders</Link>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Community
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/topics">Forum Topics</Link>
                    </li>
                    <li>
                      <Link to="/threads">Forum Threads</Link>
                    </li>
                    <li>
                      <Link to="/posts">Social</Link>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Tickets
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/tickets">List Open Tickets</Link>
                    </li>
                    <li>
                      <Link to="/tickets_closed">List Closed Tickets</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Form Submissions
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/forms/apply_for_staff">Apply for staff</Link>
                    </li>
                    <li>
                      <Link to="/forms/advertise_with_us">
                        Advertise with Us
                      </Link>
                    </li>
                    <li>
                      <Link to="/forms/subscribers">Subscribers</Link>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Withdrawals
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/withdrawal/pending">
                        Pending Withdrawal Requests
                      </Link>
                    </li>
                    <li>
                      <Link to="/withdrawal/completed">
                        Completed Withdrawal Requests
                      </Link>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Disputes
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        href="/admin/#/matchfinder/filter/disputed"
                        onClick={e => {
                          window.location.href =
                            '/admin/#/matchfinder/filter/disputed';
                          window.location.reload();
                        }}
                      >
                        matchfinder
                      </a>
                    </li>
                    <li>
                      <a
                        href="/admin/#/money8/filter/disputed"
                        onClick={e => {
                          window.location.href =
                            '/admin/#/money8/filter/disputed';
                          window.location.reload();
                        }}
                      >
                        money 8
                      </a>
                    </li>
                    <li>
                      <a
                        href="/admin/#/tournamentmatches/filter/disputed"
                        onClick={e => {
                          window.location.href =
                            '/admin/#/tournamentmatches/filter/disputed';
                          window.location.reload();
                        }}
                      >
                        tournament matches
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            ) : (
              false
            )}

            {rightNav}
          </div>
        </div>
      </nav>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user
  };
};

export default connect(mapStateToProps)(Header);
