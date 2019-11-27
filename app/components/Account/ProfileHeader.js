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
    return xp + ' season XP';
    // if (xp < 50) {
    //   return (
    //     <>
    //       Amateur <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 200) {
    //   return (
    //     <>
    //       Beginner <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 500) {
    //   return (
    //     <>
    //       Upcoming <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 1000) {
    //   return (
    //     <>
    //       Bronze <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 1500) {
    //   return (
    //     <>
    //       Silver <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 2000) {
    //   return (
    //     <>
    //       Gold <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 3000) {
    //   return (
    //     <>
    //       Platinum <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 3500) {
    //   return (
    //     <>
    //       Diamond <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    // if (xp < 4000) {
    //   return (
    //     <>
    //       Elite <span className="t-bl">({xp} season XP)</span>
    //     </>
    //   );
    // }
    //
    // // if (xp >  5000) {
    // return (
    //   <>
    //     Elite <span className="t-bl">({xp} season XP)</span>
    //   </>
    // );
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
    if (xp < 0) {
      xp = 0;
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
    if (xp < 0) {
      xp = 0;
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
    if (xp < 0) {
      xp = 0;
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
    // if(xp)
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
    );
  }

  renderXPMeter() {
    const {user_info} = this.props;
    return (
      <div className="float-right rank_box_wrap">
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
      </div>
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
        {this.props.user &&
        this.props.is_loaded &&
        this.props.user.id != user_info.id &&
        user_info.followers.length < 1 ? (
          <Link
            onClick={event => {
              this.addFriend(event);
            }}
            className="btn btn-primary bttn_submit btn-outline mw_200 m0a"
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
            className="btn btn-primary bttn_submit active mw_200 m0a"
          >
            Unfollow
          </Link>
        ) : (
          false
        )}
      </div>
    );
  }

  render() {
    const {user_info} = this.props;
    if (!user_info || !user_info.id) {
      return (
        <section
          className="page_title_bar less_padding"
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

    return (
      <section
        className="page_title_bar less_padding bigger_bg"
        id="is_top"
        style={divStyle}
      >
        <div className="container profile_container">
          <div className="row">
            <div className="col-md-3 text-center">
              {this.renderProfilePicture()}
              {this.renderNameAndFollow('mobile')}
            </div>
            <div className="col-md-5 text-center">
              {user_info.prime && (
                <img src="/assets/icons/ocg_member.png" className="img-fluid" />
              )}
            </div>
            <div className="col-md-4 justify-content-end d-flex flex-column">
              <div> </div>
              <div>
                <div className="row">
                  <div className="col-md-1" />
                  <div className="col-md-11">
                    <img
                      className="  img-fluid"
                      src={
                        '/assets/rank/' +
                        this.image_based_on_i(user_info.xp_obj) +
                        '.png'
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              {this.renderNameAndFollow('desktop')}
            </div>
            <div className="col-md-1 " />
            <div className=" order-md-last col-md-4">
              <div className="row">
                <div className="col-md-1" />
                <div className="col-md-11">{this.renderXPMeter()}</div>
              </div>
            </div>
            <div className="col-6 col-md-2 following_btn">
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

            <div className="col-6 col-md-2 following_btn">
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
