import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {add_friend} from '../../actions/social';
import {openModal} from '../../actions/modals';
import Followers from '../Modules/Modals/Followers';
import moment from 'moment';
import Following from '../Modules/Modals/Following';
// import game_user_ids from '../../../config/game_user_ids';
class ProfileHeader extends React.Component {
  state = {};
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
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    return xp;
  }

  image_based_on_i(xpo) {
    const xp = this.getXp(xpo);
    if (xp < 50) {
      return 'amateur';
    }
    if (xp < 200) {
      return 'beginner';
    }
    if (xp < 500) {
      return 'upcoming';
    }
    if (xp < 1000) {
      return 'bronze';
    }
    if (xp < 1500) {
      return 'silver';
    }
    if (xp < 2000) {
      return 'gold';
    }
    if (xp < 3000) {
      return 'platinum';
    }
    if (xp < 3500) {
      return 'diamond';
    }
    if (xp < 4000) {
      return 'elite';
    }
    return 'elite';
  }

  rank_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    if (xp < 50) {
      return 'Amateur (' + xp + ' season XP)';
    }
    if (xp < 200) {
      return 'Beginner (' + xp + ' season XP)';
    }
    if (xp < 500) {
      return 'Upcoming (' + xp + ' season XP)';
    }
    if (xp < 1000) {
      return 'Bronze (' + xp + ' season XP)';
    }
    if (xp < 1500) {
      return 'Silver (' + xp + ' season XP)';
    }
    if (xp < 2000) {
      return 'Gold (' + xp + ' season XP)';
    }
    if (xp < 3000) {
      return 'Platinum (' + xp + ' season XP)';
    }
    if (xp < 3500) {
      return 'Diamond (' + xp + ' season XP)';
    }
    if (xp < 4000) {
      return 'Elite (' + xp + ' season XP)';
    }

    // if (xp >  5000) {
    return 'Elite (' + xp + ' season XP)';
    // }
  }

  rank_min_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return '0';
    }
    if (xp < 200) {
      return '50';
    }
    if (xp < 500) {
      return '200';
    }
    if (xp < 1000) {
      return '500';
    }
    if (xp < 1500) {
      return '1000';
    }
    if (xp < 2000) {
      return '1500';
    }
    if (xp < 3000) {
      return '2000';
    }
    if (xp < 3500) {
      return '3000';
    }
    if (xp < 4000) {
      return '3500';
    }
    if (xp < 0) {
      return 0;
    }
    // if (xp >  5000) {
    return '4000';
    // }
  }

  rank_max_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return '50';
    }
    if (xp < 200) {
      return '200';
    }
    if (xp < 500) {
      return '500';
    }
    if (xp < 1000) {
      return '1000';
    }
    if (xp < 1500) {
      return '1500';
    }
    if (xp < 2000) {
      return '2000';
    }
    if (xp < 3000) {
      return '3000';
    }
    if (xp < 3500) {
      return '3500';
    }
    if (xp < 4000) {
      return '4000';
    }
    // if (xp >  5000) {
    return '5000';
    // }
  }

  rank_percent_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return (xp * 10) / 5;
    }
    if (xp < 200) {
      return ((xp - 50) / 150) * 100;
    }
    if (xp < 500) {
      return ((xp - 50) / 300) * 100;
    }
    if (xp < 1000) {
      return ((xp - 200) / 500) * 100;
    }
    if (xp < 1500) {
      return ((xp - 500) / 500) * 100;
    }
    if (xp < 2000) {
      return ((xp - 1000) / 500) * 100;
    }
    if (xp < 3000) {
      return ((xp - 1500) / 1000) * 100;
    }
    if (xp < 3500) {
      return ((xp - 2000) / 500) * 100;
    }
    if (xp < 4000) {
      return ((xp - 3000) / 500) * 100;
    }
    // if (xp >  5000) {
    return 100;
    // }
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

  render() {
    const {user_info} = this.props;
    if (!user_info || !user_info.id) {
      return (
        <section className="page_title_bar less_padding" id="is_top">
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

    return (
      <section
        className="page_title_bar less_padding"
        id="is_top"
        style={divStyle}
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3 col-sm-3 col-xs-12 d-flex align-items-end">
              <div className="game_pic_tournament profile_pic_outline square">
                <div className="content">
                  {user_info.profile_picture ? (
                    <img
                      src={user_info.profile_picture}
                      className={
                        'img-fluid ' + (user_info.prime ? ' prime ' : ' ')
                      }
                    />
                  ) : (
                    <img
                      className={
                        'img-fluid ' + (user_info.prime ? ' prime ' : ' ')
                      }
                      src={
                        'https://ui-avatars.com/api/?size=512&name=' +
                        user_info.first_name +
                        ' ' +
                        user_info.last_name +
                        '&color=223cf3&background=000000'
                      }
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-9 col-sm-9 col-xs-12 d-flex align-items-end justify-content-end align-content-end">
              <div
                className="section-headline white-headline text-left"
                style={{width: '100%'}}
              >
                <div className="list_pad">
                  <div className="row">
                    <div className="col-md-4">
                      {user_info.prime && (
                        <img
                          src="/assets/icons/ocg_member.png"
                          className="img-fluid"
                        />
                      )}
                    </div>
                    <div className="col-md-1"> </div>
                    <div className="col-md-6  align-items-end justify-content-end align-content-end">
                      <br />

                      <img
                        className="rank_imgg"
                        src={
                          '/assets/rank/' +
                          this.image_based_on_i(user_info.xp_obj) +
                          '.png'
                        }
                      />

                      <div className="float-right rank_box_wrap">
                        rank : {this.rank_based_on_xp(user_info.xp_obj)}
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
                                  '' +
                                  this.rank_percent_based_on_xp(
                                    user_info.xp_obj
                                  ) +
                                  '%'
                              }}
                            />
                          </div>
                          <span>
                            {this.rank_min_based_on_xp(user_info.xp_obj)}
                          </span>
                          <span
                            style={{
                              position: 'absolute',
                              background:
                                'url(/images/blank_ctrl.png) center no-repeat',
                              marginTop: '5px',
                              backgroundSize: 'contain',
                              padding: '5px 20px 9px 20px',
                              marginLeft: '-20px',
                              left:
                                '' +
                                this.rank_percent_based_on_xp(
                                  user_info.xp_obj
                                ) +
                                '%'
                            }}
                          >
                            {this.getXp(user_info.xp_obj)}
                          </span>
                          <span>
                            {this.rank_max_based_on_xp(user_info.xp_obj)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="list_pad">
            <div className="row">
              <div className="col-md-3">
                <h3 className="no-case-change text-center">
                  @{user_info.username}
                </h3>
              </div>

              {/*game_user_ids.tags.map((k, i) => {
                if (
                  !user_info['gamer_tag_' + k] ||
                  user_info['gamer_tag_' + k] == ''
                ) {
                  return false;
                }
                return (
                  <div className="col-md-3" key={k}>
                    <span>{game_user_ids.tag_names[k]}</span>
                    <p>{user_info['gamer_tag_' + k]}</p>
                  </div>
                );
              })*/}

              {/*}

              <div className="col-md-3">
                <span> MEMBER SINCE</span>
                <p>{moment(user_info.created_at).format('lll')}</p>
              </div>

              <div className="col-md-2">
                <span> TIME ZONE </span>
                <p>{user_info.timezone ? user_info.timezone : '-'}</p>
              </div>*/}
              <div className="col-md-2 text-right">
                {this.props.user &&
                this.props.is_loaded &&
                this.props.user.id != user_info.id &&
                user_info.followers.length < 1 ? (
                  <Link
                    onClick={event => {
                      this.addFriend(event);
                    }}
                    className="btn btn-default bttn_submit btn-outline mw_200"
                  >
                    Follow
                  </Link>
                ) : (
                  false
                )}

                {this.props.user &&
                this.props.is_loaded &&
                this.props.user.id != user_info.id &&
                user_info.followers.length > 0 ? (
                  <Link
                    onClick={event => {
                      this.addFriend(event);
                    }}
                    className="btn btn-default bttn_submit active mw_200"
                  >
                    Unfollow
                  </Link>
                ) : (
                  false
                )}
              </div>
              <div className="col-md-2">
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
                <p>
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

              <div className="col-md-2">
                <span>
                  <a
                    onClick={() => {
                      this.showFollowers(user_info.id);
                    }}
                  >
                    Followers
                  </a>
                </span>
                <p>
                  <a
                    onClick={() => {
                      this.showFollowers(user_info.id);
                    }}
                  >
                    {user_info.followerCount}
                  </a>
                </p>
              </div>

              {/*}
            <div className="col-md-4">
              <span>LIFETIME EARNINGS</span>
              <p>12/30/18 2:00PM</p>
            </div>*/}
            </div>

            {/*}<div className="col-md-4">
              <span>
                <i className="fa fa-bar-chart" aria-hidden="true" />
                40,222nd
              </span>
              <p>OCG Rank </p>
            </div>*/}

            {/*<div className="col-md-4">
              <span>
                <i className="fa fa-eye" aria-hidden="true" /> 739
              </span>
              <p>Profile Views </p>
            </div>*/}
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
                  Timeline
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
