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
            href="#"
            data-toggle="dropdown"
            className="navbar-avatar dropdown-toggle"
          >
            <img src={this.props.user.picture || this.props.user.gravatar} />{' '}
            {this.props.user.name ||
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
                  <IndexLink to="/" activeStyle={active}>
                    Home
                  </IndexLink>
                </li>
                <li>
                  <Link to="/admin_users" activeStyle={active}>
                    Admin Users
                  </Link>
                </li>
                <li>
                  <Link to="/app_users" activeStyle={active}>
                    App Users
                  </Link>
                </li>
                <li>
                  <Link to="/teams" activeStyle={active}>
                    Teams
                  </Link>
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
                      <Link to="/matchfinder">MatchFinder</Link>
                    </li>
                    <li>
                      <Link to="/money8">Money 8</Link>
                    </li>
                    <li>
                      <Link to="/tournaments">Tournaments</Link>
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
                    Games
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
                  <Link to="/app_users" activeStyle={active}>
                    Matches
                  </Link>
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
