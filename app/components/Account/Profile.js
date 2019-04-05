import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {add_post} from '../../actions/social';
import axios from 'axios';
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: {},
      user_teams: [],
      renderTab: 'profile',
      match_played: [],
      new_post_type: 'text',
      new_post_image: '',
      new_post_video: '',
      posts_page: 1
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
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
              this.fetchTeams();
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
      '/api/matches/matches_of_user?=' +
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
    fetch('/api/posts/list/my?page=' + this.state.posts_page)
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
    // console.log('here');
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
                      className="img-fluid profile_pic_outline"
                    />
                  ) : (
                    <img
                      className="img-fluid profile_pic_outline"
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
                      <div className="col-md-4">
                        <span> MEMBER SINCE</span>
                        <p>
                          {moment(this.state.user_info.created_at).format(
                            'lll'
                          )}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <span> TIME ZONE </span>
                        <p>
                          {this.state.user_info.timezone
                            ? this.state.user_info.timezone
                            : '-'}
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
                </div>
                {this.props.user &&
                this.props.user.id != this.state.user_info.id ? (
                  <Link
                    onClick={() => {
                      this.addFriend();
                    }}
                    className="btn btn-default bttn_submit"
                  >
                    Add as friend
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
                  className={this.state.renderTab == 'profile' ? 'active' : ''}
                >
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'profile'
                      });
                    }}
                  >
                    Profile
                  </Link>
                </li>
                <li
                  className={this.state.renderTab == 'updates' ? 'active' : ''}
                >
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'updates'
                      });
                    }}
                  >
                    Timeline
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
        {this.state.renderTab == 'profile' ? (
          <section className="contet_part single_match_details">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-trophy" aria-hidden="true" />{' '}
                      ACHIEVEMENT
                    </h5>

                    {/*}<div className="list_pad">
                        <div className="row">
                          <div className="col-md-2 text-center">
                            <span>
                              <img src="/images/shield-gold.png" />
                            </span>
                            <p>Win - 9 </p>
                          </div>

                          <div className="col-md-2 text-center">
                            <span>
                              <img src="/images/shield-silver.png" />
                            </span>
                            <p>Win - 6 </p>
                          </div>

                          <div className="col-md-2 text-center">
                            <span>
                              <img src="/images/shield-bronze.png" />
                            </span>
                            <p>Win - 2 </p>
                          </div>
                        </div>
                      </div>*/}
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-users" aria-hidden="true" /> TEAMS
                    </h5>

                    <ul className="team_list">
                      {this.state.user_teams.map((team_parent, i) => {
                        const team = team_parent.team_info
                          ? team_parent.team_info
                          : {};
                        return (
                          <li className="item" key={team.id}>
                            <Link
                              to={
                                '/u/' +
                                this.state.user_info.username +
                                '/teams/' +
                                team.id
                              }
                            >
                              <img src="/images/team_bg.png" />
                              <div className="info">{team.title}</div>
                            </Link>
                          </li>
                        );
                      })}
                      {this.props.user &&
                      this.state.user_info.id == this.props.user.id ? (
                        <li>
                          <a
                            href={
                              '/u/' +
                              this.state.user_info.username +
                              '/teams/new'
                            }
                          >
                            <img src="/images/team_new.png" />
                          </a>
                        </li>
                      ) : (
                        false
                      )}
                    </ul>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-user" aria-hidden="true" /> ABOUT
                    </h5>

                    <div className="list_pad">
                      <div className="row">
                        <div className="col-md-4">
                          <span> MEMBER SINCE</span>
                          <p>
                            {moment(this.state.user_info.created_at).format(
                              'lll'
                            )}
                          </p>
                        </div>

                        <div className="col-md-4">
                          <span> TIME ZONE </span>
                          <p>
                            {this.state.user_info.timezone
                              ? this.state.user_info.timezone
                              : '-'}
                          </p>
                        </div>

                        {/*}<div className="col-md-4">
                            <span>LIFETIME EARNINGS</span>
                            <p>{this.state.user_info.lifetime_earning? this.state.user_info.lifetime_earning : ''}</p>
                          </div>*/}

                        {/*}<div className="col-md-4">
                            <span> PROFILE VIEWS</span>
                            <p>436</p>
                          </div>
                          */}
                        <div className="col-md-4">
                          <span>Rank</span>
                          <p>-</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">RECORD BY MATCHES</h5>

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Team</th>
                          <th>Opponent</th>
                          <th>Result</th>
                          <th>Date</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.match_played.map((match, i) => {
                          const teams = this.getTeams(match);
                          let is_win = false;
                          let is_loss = false;
                          // is_status = true;
                          if (match.result) {
                            if (match.result == 'team_1') {
                              if (teams[2] == 1) {
                                is_win = true;
                              } else {
                                is_loss = false;
                              }
                            } else if (match.result == 'team_2') {
                              if (teams[2] == 2) {
                                is_win = true;
                              } else {
                                is_loss = false;
                              }
                            } else {
                              is_status = true;
                            }
                          }
                          {
                            is_win ? (
                              <span className="text-success">W</span>
                            ) : (
                              false
                            );
                          }
                          {
                            is_loss ? (
                              <span className="text-danger">L</span>
                            ) : (
                              false
                            );
                          }
                          {
                            !is_win && !is_loss ? match.status : false;
                          }

                          return (
                            <tr key={match.id}>
                              <td>
                                <Link to={'/m/' + match.id}>#{match.id}</Link>
                              </td>
                              <td>{teams[0].title}</td>
                              <td>{teams[1].title}</td>
                              <td>
                                {match.result ? (
                                  match.result == 'team_1' ? (
                                    teams[2] == 1 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : match.result == 'team_2' ? (
                                    teams[2] == 2 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : (
                                    match.result
                                  )
                                ) : (
                                  match.status
                                )}
                              </td>
                              {/* <td>{''}</td> */}
                              <td>{moment(match.created_at).format('lll')}</td>
                              <td>
                                {' '}
                                <Link to={'/m/' + match.id}>View Match</Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">RECENT TOURNAMENTS</h5>

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Tournament</th>
                          <th>Tournament Placing</th>
                          <th>Date</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.match_played.map((match, i) => {
                          return (
                            <tr key={match.id}>
                              <td>123</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="contet_part single_match_details">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="row">
                    <div className="col-md-6 offset-md-3">
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
                              {/* <div className="btn-group">
                              <button
                                id="btnGroupDrop1"
                                type="button"
                                className="btn btn-link dropdown-toggle"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <i className="fa fa-globe" />
                              </button>
                              <div
                                className="dropdown-menu dropdown-menu-right"
                                aria-labelledby="btnGroupDrop1"
                              >
                                <a className="dropdown-item" href="#">
                                  <i className="fa fa-globe" /> Public
                                </a>
                                <a className="dropdown-item" href="#">
                                  <i className="fa fa-users" /> Friends
                                </a>
                                <a className="dropdown-item" href="#">
                                  <i className="fa fa-user" /> Just me
                                </a>
                              </div>
                            </div> */}
                            </div>
                          </div>
                        </div>
                      </form>

                      <br />
                      <h4 className="text-white">Latest Posts</h4>
                      <ul className="timeline">
                        {this.state.posts &&
                          this.state.posts.map((post, i) => {
                            return (
                              <li key={post.id}>
                                <span className="text-date">
                                  {moment(post.created_at).format('lll')}
                                </span>
                                {post.image_url ? (
                                  <img
                                    src={post.image_url}
                                    className="img-fluid"
                                    style={{marginBottom: '10px'}}
                                  />
                                ) : (
                                  false
                                )}
                                {post.video_url ? (
                                  <div
                                    className="embed-responsive embed-responsive-21by9"
                                    style={{marginBottom: '10px'}}
                                  >
                                    <video controls>
                                      <source
                                        src={post.video_url}
                                        type="video/mp4"
                                      />
                                    </video>
                                  </div>
                                ) : (
                                  false
                                )}
                                <p>{post.post}</p>
                              </li>
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
