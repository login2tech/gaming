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
// import game_user_ids from '../../../config/game_user_ids';
class ProfileHeader extends React.Component {
  state = {
    games: []
  };
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

  renderProfilePicture() {
    const {user_info} = this.props;
    return (
      <div className="game_pic_tournament profile_pic_outline square">
        <div className="content">
          {user_info.profile_picture ? (
            <img
              src={user_info.profile_picture}
              className={'img-fluid ' + (user_info.prime ? ' prime ' : ' ')}
            />
          ) : (
            <img
              className={'img-fluid ' + (user_info.prime ? ' prime ' : ' ')}
              src={user_info.gravatar}
            />
          )}
        </div>
      </div>
    );
  }

  renderXPMeter() {
    const {user_info} = this.props;
    return (
      <a
        title="<img class='hover_img' src='/images/xp_banner_profile.png' />"
        data-toggle="tooltip"
        className="float-right rank_box_wrap"
        onClick={e => {
          e.preventDefault();
          $(e.target).tooltip('hide');
        }}
      >
        {/*rank : */}
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
              marginLeft: '-20px',
              left: '' + this.rank_percent_based_on_xp(user_info.xp_obj) + '%'
            }}
          >
            {this.getXp(user_info.xp_obj)}
          </span>
          <span>{this.rank_max_based_on_xp(user_info.xp_obj)}</span>
        </div>
      </a>
    );
  }

  renderNameAndFollow(for_m) {
    const {user_info} = this.props;
    let cls = '';
    if (for_m == 'desktop') {
      cls = ' d-none d-md-block text-center';
    } else if (for_m == 'mobile') {
      cls = '  d-md-none text-center';
    }
    return (
      <div className={cls}>
        <h1 className="no-case-change text-center">@{user_info.username}</h1>
        <div className="row">
          {this.props.user &&
          this.props.is_loaded &&
          this.props.user.id != user_info.id &&
          user_info.followers.length < 1 ? (
            <div className="col-4 pl-1 pr-1">
              <Link
                onClick={event => {
                  this.addFriend(event);
                }}
                className="btn btn-primary bttn_submit btn-outline profbtn"
              >
                Follow
              </Link>
            </div>
          ) : (
            false
          )}

          {this.props.user &&
          this.props.is_loaded &&
          this.props.user.id != user_info.id &&
          user_info.followers.length > 0 ? (
            <div className="col-4 pl-1 pr-1">
              <Link
                onClick={event => {
                  this.addFriend(event);
                }}
                className="btn btn-primary bttn_submit btn-outline profbtn"
              >
                Unfollow
              </Link>
            </div>
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
  }

  render() {
    const {user_info} = this.props;
    if (!user_info || !user_info.id) {
      return (
        <section
          className="page_title_bar less_padding d-none d-md-block"
          id="is_top"
          style={{
            backgroundPosition: 'bottom'
          }}
        >
          <br />
          <br />
          <br />
          <div className="float-right rank_box_wrap">
            <span className="fa fa-spinner fa-spin" />
          </div>
          <br />
          <br />
        </section>
      );
    }
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
      <section
        className="page_title_bar less_padding bigger_bg d-none d-md-block"
        id="is_top"
        style={divStyle}
      >
        <div className="container profile_container">
          <div className="row">
            <div className="col-md-3 col-6 text-center">
              {this.renderProfilePicture()}
              {this.renderNameAndFollow('mobile')}
            </div>
            {/*}
              <div className="col-md-1 d-none d-md-block text-center" />
            */}
            <div className="col-md-5 col-6 text-center">
              {prime_type ? (
                <img
                  src={'/assets/icons/ocg_member_' + prime_type + '.png'}
                  className="img-fluid width50per"
                />
              ) : (
                false
              )}
            </div>
            {/*}<div className="col-md-1 text-center" />*/}
            <div className="col-md-4 justify-content-end d-flex flex-column">
              <div> </div>
              <div>
                <div className="row">
                  <div className="col-md-1" />
                  <div className="col-md-11">
                    <a
                      title="<img class='hover_img' src='/images/xp_banner_profile.png' />"
                      data-toggle="tooltip"
                      className="dib"
                      onClick={e => {
                        $(e.target).tooltip('hide');
                        e.preventDefault();
                      }}
                    >
                      <img
                        className="  img-fluid"
                        src={
                          '/assets/rank/' +
                          this.image_based_on_i(user_info.xp_obj) +
                          '.png'
                        }
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              {this.renderNameAndFollow('desktop')}
            </div>
            {/*}<div className="col-md-1 " />*/}
            <div className=" order-md-last col-md-4">
              <div className="row">
                <div className="col-md-1" />
                <div className="col-md-11">{this.renderXPMeter()}</div>
              </div>
            </div>
            <div className="col-12 col-md-5 ">
              <div className="row">
                <div className="col-6 col-md-6 following_btn text-bold text-center">
                  <span>
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.showFollowing(user_info.id);
                      }}
                    >
                      Following
                    </a>
                  </span>
                  <p className="text-center">
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.showFollowing(user_info.id);
                      }}
                    >
                      {user_info.followingCount}
                    </a>
                  </p>
                </div>
                <div className="col-6 col-md-6 following_btn text-bold text-center">
                  <span>
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.showFollowers(user_info.id);
                      }}
                    >
                      Followers
                    </a>
                  </span>
                  <p className="text-center">
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.showFollowers(user_info.id);
                      }}
                    >
                      {user_info.followerCount}
                    </a>
                  </p>
                </div>
              </div>
            </div>
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
                    ? 'MY'
                    : ''}{' '}
                  TIMELINE
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
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
