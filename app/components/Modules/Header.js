import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {logout} from '../../actions/auth';
import moment from 'moment';
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
      games: [],
      userSuggestions: [],
      notifications: [],
      messages: [],
      message_counts: 0,
      dms: []
      // posts_page: 1
    };
    this.closeSide = this._closeCollapse.bind(this);
  }
  _closeCollapse() {
    // const node = this.myRef.current;
    // console.log(node);
    $('#sidebar').collapse('hide');
    $('#sidebar2').collapse('hide');
  }
  runQuery(prps) {
    fetch('/api/games/listPaged').then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState({games: obj.items});
        });
      }
      this.fetchNotifications(true);
    });
  }
  handleLogout = event => {
    event.preventDefault();
    this.props.dispatch(logout());
  };
  notifCount = notifs => {
    const unread_notif = notifs.filter(function(item) {
      return item.read ? false : true;
    });
    return unread_notif.length;
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
    // console.log('-----')
    this.runQuery();
    setInterval(() => {
      this.fetchNotifications(false);
    }, 1000 * 60 * 1);
    $(window).on('click_on_chat', () => {
      console.log('click_on_chat');
      this.fetchDMs(false);
    });
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
  deleteNotif(id, link) {
    fetch('/notifs/delete?id=' + id)
      .then(res => res.json())
      .then(json => {
        window.location.href = link;
      })
      .catch(function() {
        window.location.href = link;
      });
  }
  fetchDMs(forward) {
    if (!this.props.user) {
      return;
    }
    fetch('/api/dm/mygroups')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              dms: json.items,
              message_count: 0
            },
            this.loadReads
          );
        }
      });
  }

  loadReads() {
    for (let i = 0; i < this.state.dms.length; i++) {
      const grp_id = this.state.dms[i].id;
      this.fetchCount(grp_id);
    }
  }

  fetchCount(grp_id) {
    fetch('/api/dm/group_has_unread?grp_id=' + grp_id).then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState({
            message_count: this.state.message_count + parseInt(obj.count)
          });
        });
      }
    });
  }
  fetchNotifications(forward) {
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
        this.fetchDMs(forward);
      });
  }
  renderProfileLinks() {
    const props = this.props;
    return (
      <>
        {props.user && props.token
          ? [
              <li
                key={344}
                className="sm_on_mob has_children_m has_search_form"
              >
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
                        <Link href={'/u/' + u.username}>
                          <span className="text-sm">@{u.username}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>,
              <li key={5} className=" sm_on_mob has_children_m">
                <Link
                  className="profile_menu_item"
                  href="/notifications"
                  onClick={() => {
                    window.location.href = '/notifications';
                  }}
                >
                  <i className="fa fa-bell" />
                  {this.state.notifications &&
                  this.state.notifications.length ? (
                    <span className="dot notif_dot">
                      {this.notifCount(this.state.notifications)}
                    </span>
                  ) : (
                    false
                  )}
                </Link>
                <ul className="submenu notification_list">
                  {this.state.notifications &&
                  this.state.notifications.length ? (
                    <li className="bottom_line">
                      <a
                        className=" text-right text-danger pr-10 tc"
                        href={'/notifs/delete'}
                      >
                        Clear all
                      </a>
                    </li>
                  ) : (
                    false
                  )}
                  {this.state.notifications.map((notif, i) => {
                    if (i > 10) {
                      return false;
                    }
                    let lnk = '';
                    if (notif.type == 'money-8') {
                      lnk = '/mix-and-match/' + notif.object_id;
                    } else if (
                      notif.type == 'match' ||
                      notif.type == 'm' ||
                      notif.type == 'challenge'
                    ) {
                      lnk = '/m/' + notif.object_id;
                    } else if (notif.type == 'team_invite') {
                      lnk = '/teams/view/' + notif.object_id;
                    } else if (notif.type == 'post') {
                      lnk = '/post/' + notif.object_id;
                      // post
                    } else if ('follower' == notif.type) {
                      lnk = '/gotouser/' + notif.object_id;
                    } else if ('tournament' == notif.type) {
                      lnk = '/t/' + notif.object_id;
                    } else if ('ticket' == notif.type) {
                      lnk = '/support/tickets/ticket/' + notif.object_id;
                    } else if ('credits' == notif.type) {
                      lnk = '/my_bank';
                    }
                    return (
                      <li
                        key={notif.id}
                        className={notif.read ? ' nrread ' : ' '}
                      >
                        <a
                          onClick={e => {
                            e.preventDefault();
                            this.deleteNotif(notif.id, lnk);
                          }}
                          href={lnk}
                        >
                          {notif.description}
                          <br />
                          <small>{moment(notif.created_at).fromNow()}</small>
                          {notif.read ? (
                            false
                          ) : (
                            <span className="badge  float-right">new</span>
                          )}
                        </a>{' '}
                      </li>
                    );
                  })}
                  <li className="top_line">
                    <Link style={{fontWeight: 'bold'}} to={'/notifications'}>
                      See all notifications
                    </Link>
                  </li>
                </ul>
              </li>,
              <li key={50} className="sm_on_mob has_children_m mr-4 ml-3">
                <Link
                  className="profile_menu_item"
                  href="/messages"
                  onClick={() => {
                    window.location.href = '/messages';
                  }}
                >
                  <i className="fa fa-envelope" />
                  {this.state.message_count ? (
                    <span className="dot notif_dot">
                      {this.state.message_count}
                    </span>
                  ) : (
                    false
                  )}
                </Link>
              </li>,

              <li key={4} className="has_children_m profile_drop">
                <Link className="profile_menu_item is_avat">
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
                      <span
                        className="menu_prof_name_bot"
                        data-s={props.userHash}
                      >
                        ${props.user.cash_balance.toFixed(2)} |{' '}
                        {props.user.credit_balance} credits |{' '}
                        {props.user.life_xp} life XP
                      </span>
                    </span>
                  </span>
                </Link>
                <button className="btn btn-exp-menu">+</button>

                <ul className="submenu">
                  <li>
                    <Link
                      onClick={this.closeSide}
                      to="/dashboard"
                      className="profile_menu_item"
                    >
                      Edit Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={this.closeSide}
                      to={'/u/' + props.user.username}
                      className="profile_menu_item"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={this.closeSide}
                      to={'/transactions'}
                      className="profile_menu_item"
                    >
                      Transaction History
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={this.closeSide}
                      to="/team_invites"
                      className="profile_menu_item"
                    >
                      My Team Invites
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={this.closeSide}
                      to="/support/tickets"
                      className="profile_menu_item"
                    >
                      My Tickets
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={this.closeSide}
                      to="/my_matches"
                      className="profile_menu_item"
                    >
                      My Matches
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={this.closeSide}
                      to="/my-challenges"
                      className="profile_menu_item"
                    >
                      My Challenges
                    </Link>
                  </li>

                  <li>
                    <Link
                      onClick={this.closeSide}
                      to="/my_teams"
                      className="profile_menu_item"
                    >
                      My Teams
                    </Link>
                  </li>

                  <li>
                    <Link
                      onClick={this.closeSide}
                      to="/my_bank"
                      className="profile_menu_item"
                    >
                      My Bank
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
              <li key={3}>
                <Link
                  to="/faq"
                  className=" menu_btn bg-white text-black"
                  onClick={this.closeSide}
                >
                  HOW IT WORKS
                </Link>
              </li>,
              <li key={2}>
                <Link
                  onClick={this.closeSide}
                  className="menu_btn mr-3"
                  to="/signup"
                >
                  Join Free
                </Link>
              </li>,
              <li key={1}>
                <Link
                  to="/login"
                  className="menu_btn mr-3"
                  onClick={this.closeSide}
                >
                  LOGIN
                </Link>
              </li>
            ]}
      </>
    );
  }
  renderLinks() {
    // const props = this.props;
    return (
      <>
        <li className="has_children_m">
          <Link onClick={this.closeSide} to="/matchfinder">
            Play
          </Link>
          <button className="btn btn-exp-menu">+</button>
          <ul className="submenu">
            <li className="has_children_m">
              <Link
                onClick={e => {
                  e.preventDefault();
                }}
                to="/matchfinder"
              >
                Games
              </Link>
              <ul className="submenu">
                {this.state.games.map((game, i) => {
                  return (
                    <li key={game.id}>
                      <Link
                        onClick={this.closeSide}
                        href={
                          '/game/' +
                          game.id +
                          '/' +
                          game.title.toLowerCase().replace(/ /g, '-')
                        }
                      >
                        {game.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li>
              <Link onClick={this.closeSide} to="/matchfinder">
                MatchFinder
              </Link>
            </li>

            <li>
              <Link onClick={this.closeSide} to="/tournaments">
                Tournaments
              </Link>
            </li>
            <li>
              <Link onClick={this.closeSide} to="/mix-and-match">
                Mix & Match
              </Link>
            </li>
          </ul>
        </li>

        <li className="has_children_m">
          <Link onClick={this.closeSide} to="/feed">
            Social Feed
          </Link>
          <button className="btn btn-exp-menu">+</button>
          <ul className="submenu">
            <li>
              <Link onClick={this.closeSide} to="/feed">
                Global
              </Link>
            </li>
            <li>
              <Link onClick={this.closeSide} to="/feed/my">
                Personal
              </Link>
            </li>
          </ul>
        </li>
        <li className="has_children_m">
          <Link onClick={this.closeSide} to="/forums">
            Community
          </Link>
          <button className="btn btn-exp-menu">+</button>
          <ul className="submenu">
            <li>
              <Link onClick={this.closeSide} to="/leaderboards">
                Leaderboards
              </Link>
            </li>

            <li>
              <Link onClick={this.closeSide} to="/clip_of_the_week_month">
                Clip of the week/month
              </Link>
            </li>
            <li>
              <Link onClick={this.closeSide} to="/general-rules">
                General Rules
              </Link>
            </li>
            <li>
              <Link onClick={this.closeSide} to="/faq">
                FAQs
              </Link>
            </li>
            <li>
              <Link onClick={this.closeSide} to="/forums">
                Forums
              </Link>
            </li>
          </ul>
        </li>
        <li>
          <Link onClick={this.closeSide} to="/shop">
            Shop
          </Link>
        </li>
        <li>
          <Link onClick={this.closeSide} to="/support/tickets">
            Support
          </Link>
        </li>
      </>
    );
  }
  render() {
    const props = this.props;
    return (
      <>
        <nav id="sidebar" className="d-lg-none" key={1} ref={this.myRef}>
          <ul className="list-unstyled components">
            {this.renderProfileLinks()}
            {this.renderLinks()}
          </ul>
          <div className="sidebar_blue" onClick={this.closeSide}>
            <span className="close_side">x</span>
          </div>
        </nav>
        {!this.props.user ? (
          <nav id="sidebar2" className="d-lg-none" key={1} ref={this.myRef2}>
            <h3 className="text-center">Get Started</h3>
            <hr />
            <ul className="list-unstyled components">
              {this.renderProfileLinks()}
            </ul>
            <div className="sidebar_blue" onClick={this.closeSide}>
              <span className="close_side">x</span>
            </div>
          </nav>
        ) : (
          false
        )}

        <nav
          id="mainNav"
          className="navbar navbar-expand-lg p-0 p-md-0  p-sm-0 p-lg-2"
        >
          <div className="container">
            <div className="navbar-header fl-1">
              <button
                className="navbar-toggler float-right collapsed text-white"
                type="button"
                data-toggle="collapse"
                // data-target="#menu"
                data-target="#sidebar"
                aria-controls="menu"
                aria-expanded="false"
                aria-label="Toggle navigation"
                // className="dropdown-toggle"
              >
                <span className="navbar-toggler-icon fa fa-bars mr-2" />
                {this.state.notifications && this.state.notifications.length ? (
                  <>
                    <span className="notif_count fa fa-bell" />
                    <span className="dot notif_dot fix_ui" />
                  </>
                ) : (
                  false
                )}
              </button>
              <Link className="navbar-brand logo " to="/">
                <img
                  src={'/images/logo.png'}
                  alt="Only Comp Gaming"
                  className="Logo__logoImage__3oOkB"
                />
              </Link>
              {this.props.user ? (
                <span className="d-md-none profile_menu_item_inner small_avat">
                  <a className="menu_avatar" href={'/u/' + props.user.username}>
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
                  </a>
                </span>
              ) : (
                <button
                  className="navbar-toggler float-right collapsed login-ph-btn text-white"
                  type="button"
                  data-toggle="collapse"
                  // data-target="#menu"
                  data-target="#sidebar2"
                  aria-controls="menu"
                  aria-expanded="false"
                  aria-label="Toggle login sidebar"
                >
                  <span>JOIN FREE</span>
                  <span>LOGIN</span>
                </button>
              )}
            </div>

            <div className="collapse navbar-collapse mr-1 fl-3" id="menu">
              <ul className=" navbar-nav nav-list">{this.renderLinks()}</ul>
            </div>
            <div
              className={
                'collapse navbar-collapse ml-1 fl-2 justify-content-end ' +
                (this.props.user && this.props.token
                  ? ' is_logged_in'
                  : 'is_not_logged_in')
              }
              id="menu2"
            >
              <ul className=" navbar-nav nav-list">
                {this.renderProfileLinks()}
              </ul>
            </div>
          </div>
        </nav>

        {/*
                        <div className="container header_container">

                          <div className="row">
                            <div className="col-lg-12 col-md-12  col-xs-12 mobile_padding_remove">
                              <div className="main-menu">
                                <div className="navbar-collapse">
                                  <ul className="nav-list nav-open" id="nav">
                                    <li className="logo">
                                      <Link to="/">
                                        <img src="/images/logo.png" alt="onlycompgaming" />
                                      </Link>
                                    </li> <li>
                    <Link className="navbar-brand" to="/">
                      Home
                    </Link>
                  </li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </nav> */}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    userHash: state.auth.userHash
  };
};

// Header = withLocalize(Header);

export default connect(mapStateToProps)(Header);
