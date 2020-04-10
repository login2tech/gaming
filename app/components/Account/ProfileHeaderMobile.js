import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {add_friend} from '../../actions/social';
import {openModal} from '../../actions/modals';
import Followers from '../Modules/Modals/Followers';
// import moment from 'moment';
import Following from '../Modules/Modals/Following';
import utils from '../../utils';
import cookie from 'react-cookie';
class ProfileHeader extends React.Component {
  state = {
    games: []
  };

  componentDidMount() {
    this.runQuery();
  }

  runQuery(prps) {
    fetch('/api/games/list').then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState({games: obj.items});
        });
      }
    });
  }

  addFriend(event) {
    event.preventDefault();
    this.props.dispatch(
      add_friend(
        {
          follow_to: this.props.user_info.id
        },
        cb => {
          if (!cb) {
            //
          } else {
            //
            setTimeout(() => {
              this.props.fetchUserInfo(false);
            }, 200);
          }
        }
      )
    );
  }

  getXp(xpo) {
    const season_obj = utils.get_current_season();

    const year = season_obj[0];

    const season = season_obj[1];
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (parseInt(xpo[i].year) == year && season == parseInt(xpo[i].season)) {
        xp = xpo[i].xp;
      }
    }
    return xp;
  }

  image_based_on_i(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterImage(xp);
  }

  rank_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return xp + ' season XP';
  }

  rank_min_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterMin(xp);
  }

  rank_max_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterMax(xp);
  }

  rank_percent_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterPercent(xp);
  }

  showFollowing(id) {
    this.props.dispatch(
      openModal({
        id: 'following',
        type: 'custom',
        zIndex: 1076,
        heading: 'Followings',
        content: <Following uid={id} />
      })
    );
  }

  showFollowers(id) {
    this.props.dispatch(
      openModal({
        id: 'followers',
        type: 'custom',
        zIndex: 1075,
        heading: 'Followers',
        content: <Followers uid={id} />
      })
    );
  }

  renderXPMeter() {
    const {user_info} = this.props;
    return (
      <a
        title="<img class='hover_img' src='/images/xp_banner_profile.png' />"
        data-toggle="tooltip"
        className=""
        onClick={e => {
          $(e.target).tooltip('hide');
          e.preventDefault();
        }}
      >
        {this.rank_based_on_xp(user_info.xp_obj)}
        <div
          className="rank_box_prog_outer"
          style={{
            position: 'relative'
          }}
        >
          <div className="rank_box_prog">
            <span
              className="rank_prog_done"
              style={{
                width:
                  '' + this.rank_percent_based_on_xp(user_info.xp_obj) + '%'
              }}
            />
          </div>
          <span>{this.rank_min_based_on_xp(user_info.xp_obj)}</span>
          <span
            style={{
              position: 'absolute',
              background: 'url(/images/blank_ctrl2.png) center no-repeat',
              marginTop: '5px',
              backgroundSize: 'contain',
              padding: '5px 20px 9px 20px',
              left:
                'calc(' +
                +this.rank_percent_based_on_xp(user_info.xp_obj) +
                '% - 29px)'
            }}
          >
            {this.getXp(user_info.xp_obj)}
          </span>
          <span>{this.rank_max_based_on_xp(user_info.xp_obj)}</span>
        </div>
      </a>
    );
  }

  renderNameAndFollow(for_m, type) {
    const {user_info} = this.props;
    if (type == 2) {
      return (
        <div>
          <div className="profile-header-name profmoblfix">@{user_info.username}</div>
            <div class="row m-0">
          {this.props.user &&
          this.props.is_loaded &&
          this.props.user.id != user_info.id &&
          user_info.followers.length < 1 ? (
             <div className="col-4 pl-1 pr-1"><Link
              onClick={event => {
                this.addFriend(event);
              }}
              className="btn btn-primary bttn_submit btn-outline mw_200 "
            >
              Follow
            </Link></div>
          ) : (
            false
          )}

          {this.props.user &&
          this.props.is_loaded &&
          this.props.user.id != user_info.id &&
          user_info.followers.length > 0 ? (
             <div className="col-4 pl-1 pr-1"><Link
              onClick={event => {
                this.addFriend(event);
              }}
              className="btn    bttn_submit btn-outline mw_200 unflowbtn"
            >
              Unfollow
            </Link></div>
          ) : (
            false
          )}
          {this.props.user &&
          this.props.is_loaded &&
          this.props.user.id != user_info.id ? (
            <div className="col-4 pl-1 pr-1">
              <div className={'dropdown fl-right profbtn'}>
                <button
                  className="btn btn-default bttn_submit dropdown-toggle profbtn"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Challenge
                </button>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  {this.state.games &&
                    this.state.games.map((game, i) => {
                      return (
                        game.ladders &&
                        game.ladders.map((ladder, i) => {
                          if (ladder.min_players > 1) {
                            return false;
                          }
                          return (
                            <a
                              className={'dropdown-item'}
                              onClick={() => {
                                cookie.save(
                                  'challenging_team',
                                  '@' + this.props.user_info.username,
                                  {
                                    path: '/',
                                    expires: moment()
                                      .add(1, 'day')
                                      .toDate()
                                  }
                                );
                              }}
                              href={
                                '/challenge/new/g/' +
                                ladder.game_id +
                                '/l/' +
                                ladder.id +
                                '/u/' +
                                this.props.user_info.id
                              }
                              key={ladder.id}
                            >
                              {game.title} - {ladder.title}
                            </a>
                          );
                        })
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            false
          )}

          {this.props.user &&
          this.props.is_loaded &&
          this.props.user.id != user_info.id ? (
            <div className="col-4 pl-1 pr-1">
              <button
                className="btn btn-default bttn_submit  profbtn"
                type="button"
                onClick={e => {
                  this.props.onChat(e);
                }}
              >
                Send DM
              </button>
            </div>
          ) : (
            false
          )}
        </div>
        </div>
      );
    } else {
      return (
        <div
          className="row"
          style={{
                alignItems: 'flex-end'
          }}
        >
          <div className="profile-header-text col-6">
            <button
              className="btn btn-default bg-transparent text-white"
              onClick={e => {
                e.preventDefault();
                this.showFollowers(user_info.id);
              }}
            >
              Followers: {user_info.followerCount}
            </button>
          </div>
          <div className="profile-header-text col-6">
            <button
              className="btn btn-default bg-transparent text-white"
              onClick={e => {
                e.preventDefault();
                this.showFollowing(user_info.id);
              }}
            >
              Following {user_info.followingCount}
            </button>
          </div>
        </div>
      );
    }
  }

  render() {
    const {user_info} = this.props;
    const divStyle = user_info.cover_picture
      ? {
          backgroundImage: 'url(' + user_info.cover_picture + ')'
        }
      : {};

    let prime_obj;
    let prime_type = '';
    if (user_info.prime) {
      prime_obj = user_info.prime_obj;
      if (!prime_obj) {
        prime_obj = '{}';
      }
      prime_obj = JSON.parse(prime_obj);
      prime_type = prime_obj.prime_type;
    }
    return (
      <div
        id="profile-page-container"
        className="profile-page user-profile d-md-none"
      >
        <div className="user-status-mobile visible-xs">
          {prime_type ? (
            <img
              src={'/assets/icons/ocg_member_' + prime_type + '.png'}
              className="img-fluid member-star-mobile"
            />
          ) : (
            false
          )}
        </div>
        <div className="profile-header" style={divStyle} />
        <div className="container profile-page-container">
          <div className="profile-header-data forteamf flwrap">
            <div className="profile-header-data-left">
              <div className="profile-avatar">
                {user_info.profile_picture ? (
                  <img
                    src={user_info.profile_picture}
                    className={
                      'profile-mobile-avat ' +
                      (user_info.prime ? ' prime ' : ' ')
                    }
                  />
                ) : (
                  <img
                    className={
                      'profile-mobile-avat ' +
                      (user_info.prime ? ' prime ' : ' ')
                    }
                    src={user_info.gravatar}
                  />
                )}
              </div>
            </div>



            <div className="profile-header-data-middle mb-1 full-width">
              {this.renderNameAndFollow('desktop', 2)}
            </div>
            <div className="profile-header-data-middle pt-1 mt-1 fllwbtns"  >
              {this.renderNameAndFollow('desktop', 1)}
            </div>
          </div>
          <div className="row">
            <div className="user-rank-mobile row  rank_box_wrap">
              <div className="col-3">
                <img
                  src={
                    '/assets/rank/' +
                    this.image_based_on_i(user_info.xp_obj) +
                    '.png'
                  }
                  className="rank-image float-left"
                />
              </div>
              <div className="col-9  rank-data">{this.renderXPMeter()}</div>
            </div>
            <div className="col-xs-12 profile-page-stats-block-wrapper">
              <div className="profile-page-stats-block" />
            </div>
            <div className="clearfix" />
          </div>
        </div>
        <div className="baris">
          <div className="container">
            <ul className="lnkss">
              <li
                className={this.props.current_tab == 'profile' ? 'active' : ''}
              >
                <Link to={'/u/' + user_info.username}>Profile</Link>
              </li>
              <li
                className={this.props.current_tab == 'timeline' ? 'active' : ''}
              >
                <Link to={'/u/' + user_info.username + '/timeline'}>
                  {this.props.user &&
                  user_info &&
                  user_info.id == this.props.user.id
                    ? 'MY '
                    : ''}{' '}
                  TIMELINE
                </Link>
              </li>

            </ul>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(ProfileHeader);
