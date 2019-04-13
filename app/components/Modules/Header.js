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
                  {/* <li>
                    <Link className="navbar-brand" to="/">
                      Home
                    </Link>
                  </li> */}
                  <li>
                    <Link to="/matchfinder">MatchFinder</Link>
                  </li>
                  <li>
                    <Link to="/tournaments">Tournaments</Link>
                  </li>
                  <li className="has_children_m">
                    <Link to="/feed">Social Feed</Link>
                    <ul className="submenu">
                      <li>
                        <Link to="/feed">All</Link>
                      </li>
                      <li>
                        <Link to="/feed/my">My</Link>
                      </li>
                      <li>
                        <Link to="/clip_of_the_week_month">
                          Clip of the week / month
                        </Link>
                      </li>
                    </ul>
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

                  <li>
                    <Link className="profile_menu_item">
                      <i className="fa fa-search" />
                    </Link>
                  </li>

                  {props.user
                    ? [
                        <li key={5} className="has_children_m">
                          <Link className="profile_menu_item">
                            <i className="fa fa-bell" />
                          </Link>
                          <ul className="submenu notification_list">
                            <li>Match #123 started</li>
                          </ul>
                        </li>,

                        <li key={4} className="has_children_m">
                          <Link className="profile_menu_item">
                            <span className="profile_menu_item_inner">
                              <span className="menu_avatar">
                                {props.user && props.user.profile_picture ? (
                                  <img
                                    src={props.user.profile_picture}
                                    className="img-fluid profile_pic_outline"
                                  />
                                ) : (
                                  <img
                                    className="img-fluid profile_pic_outline"
                                    src={
                                      'https://ui-avatars.com/api/?size=512&name=' +
                                      props.user.first_name +
                                      ' ' +
                                      props.user.last_name +
                                      '&color=223cf3&background=000000'
                                    }
                                  />
                                )}
                              </span>
                              <span className="menu_prof_name_w">
                                <span className="menu_prof_name_top">
                                  Hello, {props.user.first_name}
                                </span>
                                <span className="menu_prof_name_bot">
                                  ${props.user.cash_balance} |{' '}
                                  {props.user.credit_balance} credits
                                </span>
                              </span>
                            </span>
                          </Link>
                          <ul className="submenu">
                            <li>
                              <Link
                                to="/dashboard"
                                className="profile_menu_item"
                              >
                                Dashboard
                              </Link>
                            </li>
                            <li>
                              <Link
                                to={'/u/' + props.user.username}
                                className="profile_menu_item"
                              >
                                Porfile
                              </Link>
                            </li>
                            <li>
                              <Link
                                onClick={event => {
                                  handleLogout(event);
                                }}
                              >
                                Logout
                              </Link>
                            </li>
                          </ul>
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
