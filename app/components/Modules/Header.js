import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {logout} from '../../actions/auth';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
      userSuggestions: [],
      notifications: []
      // posts_page: 1
    };
  }

  handleLogout = event => {
    event.preventDefault();
    this.props.dispatch(logout());
  };

  getSuggestions(event) {
    const val = event.target.value;
    this.setState(
      {
        searchString: val
      },
      () => {
        this.fetchSuggestions();
      }
    );
  }
  componentDidMount() {
    this.fetchNotifications();
    setInterval(() => {
      this.fetchNotifications();
    }, 1000 * 60 * 3);
  }

  fetchSuggestions() {
    fetch('/api/user_suggest?q=' + this.state.searchString)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            userSuggestions: json.items
          });
        }
      });
  }

  fetchNotifications() {
    if (!this.props.user) {
      return;
    }
    fetch('/notifs/listMine')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            notifications: json.notifs
          });
        }
      });
  }

  render() {
    const props = this.props;
    return (
      <nav id="mainNav">
        <div className="container header_container">
          <div className="row">
            <div className="col-lg-3 col-md-3  col-2 text-right">
              <a href="#" className="toggle-menu">
                &#9776;
              </a>
            </div>
            <div className=" col-4">
              <div className="mobile-display">
                <Link to="/">
                  <img src="/images/logo.png" alt="onlycompgaming" />
                </Link>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 col-md-12  col-xs-12 mobile_padding_remove">
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
                    <li className="has_children_m">
                      <Link to="/matchfinder">Play</Link>
                      <ul className="submenu">
                        <li>
                          <Link to="/matchfinder">MatchFinder</Link>
                        </li>
                        <li>
                          <Link to="/tournaments">Tournaments</Link>
                        </li>
                        <li>
                          <Link to="/mix-and-match">Mix & Match</Link>
                        </li>
                      </ul>
                    </li>

                    <li className="has_children_m">
                      <Link to="/feed">Social Feed</Link>
                      <ul className="submenu">
                        <li>
                          <Link to="/feed">Global</Link>
                        </li>
                        <li>
                          <Link to="/feed/my">Personal</Link>
                        </li>
                      </ul>
                    </li>
                    <li className="has_children_m">
                      <Link to="/forums">Community</Link>
                      <ul className="submenu">
                        <li>
                          <Link to="/forums">Forums</Link>
                        </li>

                        <li>
                          <Link to="/leaderboards">Leaderboards</Link>
                        </li>

                        <li>
                          <Link to="/clip_of_the_week_month">
                            Clip of the week/month
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Link to="/shop">Shop</Link>
                    </li>
                    <li>
                      <Link to="/support/tickets">Support</Link>
                    </li>

                    <li className="has_children_m has_search_form">
                      <Link className="profile_menu_item">
                        <i className="fa fa-search" />
                      </Link>
                      <ul className="submenu notification_list user_sugggestions">
                        <li>
                          <input
                            type="text"
                            autoFocus
                            className="dark_text form-control"
                            placeholder={'Search here...'}
                            value={this.state.searchString}
                            onChange={event => {
                              this.getSuggestions(event);
                            }}
                          />
                        </li>
                        {this.state.userSuggestions.map((u, i) => {
                          return (
                            <li key={u.id}>
                              <Link to={'/u/' + u.username}>
                                <span className="text-sm">@{u.username}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>

                    {props.user && props.token
                      ? [
                          <li key={5} className="has_children_m">
                            <Link
                              className="profile_menu_item"
                              to="/notifications"
                            >
                              <i className="fa fa-bell" />
                              {this.state.notifications &&
                              this.state.notifications.length ? (
                                <span className="dot notif_dot">
                                  {this.state.notifications.length}
                                </span>
                              ) : (
                                false
                              )}
                            </Link>
                            <ul className="submenu notification_list">
                              {this.state.notifications.map((notif, i) => {
                                if (i > 10) {
                                  return false;
                                }
                                let lnk = '';
                                if (notif.type == 'money-8') {
                                  lnk = '/mix-and-match/' + notif.object_id;
                                } else if (notif.type == 'match') {
                                  lnk = '/m/' + notif.object_id;
                                } else if (notif.type == 'team_invite') {
                                  lnk = '/teams/view/' + notif.object_id;
                                } else if (notif.type == 'post') {
                                  lnk = '/post/' + notif.object_id;
                                  // post
                                } else if (notif.type == 'follower') {
                                  //follower
                                } else if ('tournament' == notif.type) {
                                  lnk = '/t/' + notif.object_id;
                                } else if ('ticket' == notif.type) {
                                  lnk =
                                    '/support/tickets/ticket/' +
                                    notif.object_id;
                                }

                                return (
                                  <li key={notif.id}>
                                    <Link to={lnk}>{notif.description}</Link>{' '}
                                    <button
                                      style={{display: 'none'}}
                                      className="btn removeNotif"
                                    >
                                      <span className="text-danger fa fa-times" />
                                    </button>
                                  </li>
                                );
                              })}
                              <li>
                                <Link
                                  style={{fontWeight: 'bold'}}
                                  to={'/notifications'}
                                >
                                  See all notifications
                                </Link>
                              </li>
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
                                    {props.user.credit_balance} credits |{' '}
                                    {props.user.life_xp} life XP
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
                                  Profile
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to={'/transactions'}
                                  className="profile_menu_item"
                                >
                                  Transaction History
                                </Link>
                              </li>
                              {this.props.user.role == 'admin' ? (
                                <li>
                                  <a href="/admin">Admin Panel</a>
                                </li>
                              ) : (
                                false
                              )}
                              <li>
                                <Link
                                  onClick={event => {
                                    this.handleLogout(event);
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
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user
  };
};

// Header = withLocalize(Header);

export default connect(mapStateToProps)(Header);
