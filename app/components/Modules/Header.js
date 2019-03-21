import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {logout} from '../../actions/auth';

const Header = props => {
  const handleLogout = event => {
    event.preventDefault();
    props.dispatch(logout());
  };

  return (
    <nav id="mainNav">
      <div className="container">
        <div className="row">
          <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9">
            <div className="mobile-display">
              <Link to="/">
                <img src="/images/logo.png" alt="onlycompgaming" />
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 text-right">
            <a href="#" className="toggle-menu">
              &#9776;
            </a>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 mobile_padding_remove">
            <div className="main-menu">
              <div className="navbar-collapse">
                <ul className="nav-list nav-open" id="nav">
                  <li className="logo">
                    <Link to="/">
                      <img src="/images/logo.png" alt="onlycompgaming" />
                    </Link>
                  </li>
                  <li>
                    <Link className="navbar-brand" to="/">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/matchfinder">MatchFinder</Link>
                  </li>
                  <li>
                    <Link to="/tournaments">Tournaments</Link>
                  </li>
                  <li>
                    <Link to="/forums">Community</Link>
                  </li>
                  <li>
                    <Link to="/shop">Shop</Link>
                  </li>
                  <li>
                    <Link to="/support/tickets">Support</Link>
                  </li>

                  {props.user
                    ? [
                        <li key={4}>
                          <Link to="/dashboard">Dashboard</Link>
                        </li>,
                        <li key={2}>
                          <Link
                            onClick={event => {
                              handleLogout(event);
                            }}
                          >
                            Logout
                          </Link>
                        </li>
                      ]
                    : [
                        <li key={1}>
                          <Link to="/login">Login</Link>
                        </li>,
                        <li key={2}>
                          <Link className="menu_btn" to="/signup">
                            Signup
                          </Link>
                        </li>
                      ]}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user
  };
};

// Header = withLocalize(Header);

export default connect(mapStateToProps)(Header);
