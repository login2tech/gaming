import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: {},
      user_teams: [],
      renderTab: 'profile',
      match_played: []
    };
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
              // this.fetchMatches();
            }
          );
        }
      });
  }

  fetchMatches() {
    // return;
    fetch('/api/matches/matches_of_user?uid=' + this.state.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              match_played: json.matches
            },
            () => {
              this.fetchMatches();
            }
          );
        }
      });
  }

  render() {
    const divStyle = this.state.new_cover_pic
      ? {
          backgroundImage: 'url(' + this.state.new_cover_pic + ')'
        }
      : this.props.user.cover_picture
        ? {
            backgroundImage: 'url(' + this.props.user.cover_picture + ')'
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
                  {this.props.user.profile_picture ? (
                    <img
                      src={this.props.user.profile_picture}
                      className="img-fluid profile_pic_outline"
                    />
                  ) : (
                    <img
                      className="img-fluid profile_pic_outline"
                      src={
                        'https://ui-avatars.com/api/?size=512&name=' +
                        this.props.user.first_name +
                        ' ' +
                        this.props.user.last_name +
                        '&color=223cf3&background=000000'
                      }
                    />
                  )}
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>
                    {this.state.user_info.first_name}{' '}
                    {this.state.user_info.last_name}
                  </h3>

                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MEMBER SINCE</span>
                        <p>
                          {moment(this.props.user.created_at).format('lll')}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <span> TIME ZONE </span>
                        <p>
                          {this.props.user.timezone
                            ? this.props.user.timezone
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
                    Updates
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
                          <th>UserXP</th>
                          <th>DoubleXP</th>
                          <th>Date</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.match_played.map((match, i) => {
                          return (
                            <tr key={match.id}>
                              <td>
                                <Link to={'/m/' + match.id}>#{match.id}</Link>
                              </td>
                              <td>{match.team_1_info.title}</td>
                              <td>{match.team_2_info.title}</td>
                              <td>{''}</td>
                              <td>{''}</td>
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
                      <div className="card gedf-card">
                        <div className="card-header">
                          <ul
                            className="nav nav-tabs card-header-tabs"
                            id="myTab"
                            role="tablist"
                          >
                            <li className="nav-item">
                              <a
                                className="nav-link active"
                                id="posts-tab"
                                data-toggle="tab"
                                href="#posts"
                                role="tab"
                                aria-controls="posts"
                                aria-selected="true"
                              >
                                Make a publication
                              </a>
                            </li>
                            <li className="nav-item">
                              <a
                                className="nav-link"
                                id="images-tab"
                                data-toggle="tab"
                                role="tab"
                                aria-controls="images"
                                aria-selected="false"
                                href="#images"
                              >
                                Images
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
                              <div className="form-group">
                                <label className="sr-only" htmlFor="message">
                                  post
                                </label>
                                <textarea
                                  className="form-control"
                                  id="message"
                                  rows="3"
                                  placeholder="What are you thinking?"
                                />
                              </div>
                            </div>
                            <div
                              className="tab-pane fade"
                              id="images"
                              role="tabpanel"
                              aria-labelledby="images-tab"
                            >
                              <div className="form-group">
                                <div className="custom-file">
                                  <input
                                    type="file"
                                    className="custom-file-input"
                                    id="customFile"
                                  />
                                  <label
                                    className="custom-file-label"
                                    htmlFor="customFile"
                                  >
                                    Upload image
                                  </label>
                                </div>
                              </div>
                              <div className="py-4" />
                            </div>
                          </div>
                          <div className="btn-toolbar justify-content-between">
                            <div className="btn-group">
                              <button type="submit" className="btn btn-primary">
                                share
                              </button>
                            </div>
                            <div className="btn-group">
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
                            </div>
                          </div>
                        </div>
                      </div>

                      <br />
                      <h4 className="text-white">Latest Posts</h4>
                      <ul className="timeline">
                        {this.state.timeline &&
                          this.state.timeline.map((post, i) => {
                            return (
                              <li key={post.id}>
                                <span className="float-right">
                                  {moment(post.created_at).format('lll')}
                                </span>
                                <p>{post.content}</p>
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
