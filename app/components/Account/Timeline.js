import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {add_post, add_friend} from '../../actions/social';
import axios from 'axios';
import Timeline from '../Social/Timeline';
import {openModal} from '../../actions/modals';
import Followers from '../Modules/Modals/Followers';
import Following from '../Modules/Modals/Following';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: {first_name: ' ',last_name: ' ', followers: [], teams: [], xp_obj: [], score: []},
      user_teams: [],
      renderTab: 'profile',
      match_played: [],
      new_post_type: 'text',
      new_post_image: '',
      new_post_video: '',
      posts_page: 1
    };
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

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  rank_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return 'Amatuer';
    }
    if (xp < 200) {
      return 'Beginner';
    }
    if (xp < 500) {
      return 'Upcoming';
    }
    if (xp < 1000) {
      return 'Bronze';
    }
    if (xp < 1500) {
      return 'Silver';
    }
    if (xp < 2000) {
      return 'Gold';
    }
    if (xp < 3000) {
      return 'Platinum';
    }
    if (xp < 3500) {
      return 'Diamond';
    }
    if (xp < 4000) {
      return 'Elite';
    }
    // if (xp >  5000) {
    return 'Elite';
    // }
  }

  rank_min_based_on_xp(xp) {
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
    // if (xp >  5000) {
    return '4000';
    // }
  }

  rank_max_based_on_xp(xp) {
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

  rank_percent_based_on_xp(xp) {
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

  getTeams(match) {
    const team_1_id = match.team_1_id;
    const team_2_id = match.team_2_id;
    const {user_teams} = this.state;

    for (let i = 0; i < user_teams.length; i++) {
      if (team_1_id == user_teams[i].team_info.id) {
        return [match.team_1_info, match.team_2_info, 1];
      }
      if (team_2_id == user_teams[i].team_info.id) {
        return [match.team_2_info, match.team_1_info, 2];
      }
    }
    return [match.team_1_info, match.team_2_info, 1];
  }

  componentDidMount() {
    setTimeout(function() {
      const element = document.getElementById('is_top');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 1000);
    this.fetchUserInfo(true);
  }

  fetchUserInfo(forward) {
    fetch('/api/user_info?uid=' + this.props.params.username)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              user_info: json.user_info
            },
            () => {
              if (forward) {
                this.fetchTeams();
              }
            }
          );
        }
      });
  }

  fetchTeams() {
    fetch('/api/teams/team_of_user?uid=' + this.state.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              user_teams: json.teams
            },
            () => {
              this.fetchPosts();
            }
          );
        }
      });
  }

  fetchMatches() {
    let team_array = [];
    for (let i = 0; i < this.state.user_teams.length; i++) {
      const team_parent = this.state.user_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : {};
      team_array.push(team.id);
    }
    team_array = team_array.join(',');

    fetch(
      '/api/matches/matches_of_user?uid=' +
        this.state.user_info.id +
        '&teams=' +
        team_array
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              match_played: json.items
            },
            () => {}
          );
        }
      });
  }

  fetchPosts() {
    fetch(
      '/api/posts/list/my?uid=' +
        this.state.user_info.id +
        '&page=' +
        this.state.posts_page
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              posts: json.items
            },
            () => {
              this.fetchMatches();
            }
          );
        }
      });
  }

  addFriend(event) {
    event.preventDefault();
    this.props.dispatch(
      add_friend(
        {
          follow_to: this.state.user_info.id
        },
        cb => {
          if (!cb) {
            //
          } else {
            //
            setTimeout(() => {
              this.fetchUserInfo(false);
            }, 200);
          }
        }
      )
    );
  }

  doPostNew(event) {
    event.preventDefault();

    this.props.dispatch(
      add_post(
        {
          post_type: this.state.new_post_type,
          image_url: this.state.new_post_image,
          video_url: this.state.new_post_video,
          content: this.state.new_post_content
        },
        this.props.token,
        (result, post) => {
          if (result) {
            const posts = this.state.posts;
            posts.unshift(post);
            this.setState({
              posts: posts,
              new_post_type: 'text',
              new_post_image: '',
              new_post_video: '',
              new_post_content: ''
            });
          }
        }
      )
    );
  }

  askFile(cls, cb) {
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          // this.setState({
          //   loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          // });
        }
      })
      .then(res => {
        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured.');
        // console.log(err);
      });
  }

  handleImageUpload = event => {
    this.setState(
      {
        post_image_select: event.target.files[0]
      },
      () => {
        this.askFile('post_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_post_image: data.file
            });
          }
        });
      }
    );
  };

  handleVideoUpload = event => {
    this.setState(
      {
        post_video_select: event.target.files[0]
      },
      () => {
        this.askFile('post_video_select', data => {
          if (data && data.file) {
            this.setState({
              new_post_video: data.file
            });
          }
        });
      }
    );
  };

  tags = [1, 2, 3, 4, 5];
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    // 'Username',
    'Epic Games Username',
    'Steam Username',
    'Battletag'
  ];

  render() {
    const divStyle = this.state.new_cover_pic
      ? {
          backgroundImage: 'url(' + this.state.new_cover_pic + ')'
        }
      : this.state.user_info && this.state.user_info.cover_picture
      ? {
          backgroundImage: 'url(' + this.state.user_info.cover_picture + ')'
        }
      : {};
    return (
      <div>
        <section
          className="page_title_bar less_padding"
          id="is_top"
          style={divStyle}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12">
                <div className="game_pic_tournament">
                  {this.state.user_info &&
                  this.state.user_info.profile_picture ? (
                    <img
                      src={this.state.user_info.profile_picture}
                      className={
                        'img-fluid profile_pic_outline' +
                        (this.state.user_info.prime ? ' prime ' : ' ')
                      }
                    />
                  ) : (
                    <img
                      className={
                        'img-fluid profile_pic_outline' +
                        (this.state.user_info.prime ? ' prime ' : ' ')
                      }
                      src={
                        'https://ui-avatars.com/api/?size=512&name=' +
                        this.state.user_info.first_name +
                        ' ' +
                        this.state.user_info.last_name +
                        '&color=223cf3&background=000000'
                      }
                    />
                  )}
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>
                    {this.state.user_info && this.state.user_info.first_name}{' '}
                    {this.state.user_info && this.state.user_info.last_name}
                  </h3>

                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-3">
                        <span> MEMBER SINCE</span>
                        <p>
                          {moment(this.state.user_info.created_at).format(
                            'lll'
                          )}
                        </p>
                      </div>

                      <div className="col-md-3">
                        <span> TIME ZONE </span>
                        <p>
                          {this.state.user_info.timezone
                            ? this.state.user_info.timezone
                            : '-'}
                        </p>
                      </div>

                      <div className="col-md-3">
                        <span>
                          <a
                            onClick={() => {
                              this.showFollowing(this.state.user_info.id);
                            }}
                          >
                            Following
                          </a>
                        </span>
                        <p>
                          <a
                            onClick={() => {
                              this.showFollowing(this.state.user_info.id);
                            }}
                          >
                            {this.state.user_info.followingCount}
                          </a>
                        </p>
                      </div>

                      <div className="col-md-3">
                        <span>
                          <a
                            onClick={() => {
                              this.showFollowers(this.state.user_info.id);
                            }}
                          >
                            Followers
                          </a>
                        </span>
                        <p>
                          <a
                            onClick={() => {
                              this.showFollowers(this.state.user_info.id);
                            }}
                          >
                            {this.state.user_info.followerCount}
                          </a>
                        </p>
                      </div>
                      {/*}
                      <div className="col-md-4">
                        <span>LIFETIME EARNINGS</span>
                        <p>12/30/18 2:00PM</p>
                      </div>*/}
                    </div>

                    <div className="row">
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

                  <div className="float-right rank_box_wrap">
                    rank : {this.rank_based_on_xp(this.state.user_info.xp_obj)}
                    <div className="rank_box_prog_outer">
                      <div className="rank_box_prog">
                        <span
                          className="rank_prog_done"
                          style={{
                            width:
                              '' +
                              this.rank_percent_based_on_xp(
                                this.state.user_info.life_xp
                              ) +
                              '%'
                          }}
                        />
                      </div>
                      <span>
                        {this.rank_min_based_on_xp(
                          this.state.user_info.life_xp
                        )}
                      </span>
                      <span>
                        {this.rank_max_based_on_xp(
                          this.state.user_info.life_xp
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {this.props.user &&
                this.state.is_loaded &&
                this.props.user.id != this.state.user_info.id &&
                this.state.user_info.followers.length < 1 ? (
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
                this.state.is_loaded &&
                this.props.user.id != this.state.user_info.id &&
                this.state.user_info.followers.length > 0 ? (
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
            </div>
          </div>
          <div className="baris">
            <div className="container">
              <ul className="lnkss">
                <li
                   
                >
                  <Link
                    to={"/u/"+this.props.params.username+''}
                  >
                    Profile
                  </Link>
                </li>
                <li
                  className={'active'}
                >
                  <Link
                    // onClick={() => {
                    //   this.setState({
                    //     renderTab: 'updates'
                    //   });
                    // }}
                  >
                    Timeline
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
         
          <section className="contet_part single_match_details">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="row">
                    <div className="col-md-8 offset-md-2">
                      {this.props.user &&
                      this.props.user.id == this.state.user_info.id ? (
                        <form
                          onSubmit={event => {
                            this.doPostNew(event);
                          }}
                        >
                          <div className="card gedf-card">
                            <div className="card-header">
                              <ul
                                className="nav nav-tabs card-header-tabs"
                                id="myTab"
                                role="tablist"
                              >
                                <li className="nav-item">
                                  <a
                                    className={
                                      'nav-link' +
                                      (this.state.new_post_type == 'text'
                                        ? ' active '
                                        : '')
                                    }
                                    id="posts-tab"
                                    // data-toggle="tab"
                                    // href="#posts"
                                    // role="tab"
                                    // aria-controls="posts"
                                    // aria-selected="true/"
                                    onClick={() => {
                                      this.setState({
                                        new_post_type: 'text',
                                        new_post_image: '',
                                        new_post_video: '',
                                        post_video_select: ''
                                      });
                                    }}
                                  >
                                    Post
                                  </a>
                                </li>
                                <li className="nav-item">
                                  <a
                                    className={
                                      'nav-link' +
                                      (this.state.new_post_type == 'image'
                                        ? ' active '
                                        : '')
                                    }
                                    id="images-tab"
                                    onClick={() => {
                                      this.setState({
                                        new_post_type: 'image',
                                        // new_post_image: '',
                                        new_post_video: '',
                                        post_image_select: ''
                                      });
                                    }}
                                    // data-toggle="tab"
                                    // role="tab"
                                    // aria-controls="images"
                                    // aria-selected="false"
                                    // href="#images"
                                  >
                                    <i className="fa fa-image" />
                                  </a>
                                </li>
                                <li className="nav-item">
                                  <a
                                    className={
                                      'nav-link' +
                                      (this.state.new_post_type == 'video'
                                        ? ' active '
                                        : '')
                                    }
                                    id="videos-tab"
                                    // data-toggle="tab"
                                    // role="tab"
                                    // aria-controls="videos"
                                    // aria-selected="false"
                                    // href="#videos"
                                    onClick={() => {
                                      this.setState({
                                        new_post_type: 'video',
                                        new_post_image: ''
                                        // new_post_video: ''
                                      });
                                    }}
                                  >
                                    <i className="fa fa-video-camera" />
                                  </a>
                                </li>
                              </ul>
                            </div>
                            <div className="card-body">
                              <div className="tab-content" id="myTabContent">
                                <div
                                  className="tab-pane fade show active"
                                  id="posts"
                                  role="tabpanel"
                                  aria-labelledby="posts-tab"
                                >
                                  {this.state.new_post_type == 'image' ? (
                                    <div className="custom-file">
                                      <input
                                        type="file"
                                        className="custom-file-input"
                                        id="customFile"
                                        onChange={this.handleImageUpload}
                                      />
                                      <label
                                        className="custom-file-label"
                                        htmlFor="customFile"
                                      >
                                        Upload image
                                      </label>
                                    </div>
                                  ) : (
                                    false
                                  )}

                                  {this.state.new_post_type == 'video' ? (
                                    <div className="custom-file">
                                      <input
                                        type="file"
                                        className="custom-file-input"
                                        id="customFile"
                                        onChange={this.handleVideoUpload}
                                      />
                                      <label
                                        className="custom-file-label"
                                        htmlFor="customFile"
                                      >
                                        Upload video
                                      </label>
                                    </div>
                                  ) : (
                                    false
                                  )}
                                  {this.state.new_post_image != '' ? (
                                    <img
                                      src={this.state.new_post_image}
                                      className="img-fluid"
                                      style={{marginBottom: '10px'}}
                                    />
                                  ) : (
                                    false
                                  )}

                                  {this.state.new_post_video != '' ? (
                                    <div
                                      className="embed-responsive embed-responsive-21by9"
                                      style={{marginBottom: '10px'}}
                                    >
                                      <video>
                                        <source
                                          src={this.state.new_post_video}
                                          type="video/mp4"
                                        />
                                      </video>
                                    </div>
                                  ) : (
                                    false
                                  )}
                                  <div className="form-group">
                                    <textarea
                                      className="form-control"
                                      id="new_post_content"
                                      required
                                      rows="3"
                                      value={this.state.new_post_content}
                                      placeholder="What are you thinking?"
                                      name="new_post_content"
                                      onChange={this.handleChange.bind(this)}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="btn-toolbar justify-content-between">
                                <div className="btn-group">
                                  <button
                                    type="submit"
                                    className="btn btn-primary"
                                  >
                                    share
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      ) : (
                        false
                      )}

                      <br />
                      <h4 className="text-white">Latest Posts</h4>
                      <ul className="timeline">
                        {this.state.posts &&
                          this.state.posts.map((post, i) => {
                            return (
                              <Timeline
                                post={post}
                                key={post.id}
                                show_option_to_pin
                              />
                            );
                          })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
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

export default connect(mapStateToProps)(Profile);
