import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {inviteToTeam, approveRequest, teamPic} from '../../actions/team';
import Messages from '../Modules/Messages';
import axios from 'axios';

class TeamInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      team_info: {ladder: {}, team_users: []},
      game: {},
      is_loaded:false,
      match_played: [],
      new_invite_user_name: '',
      is_edit_mode: false
    };
  }
  approveRequest(event, reject) {
    event.preventDefault();
    this.props.dispatch(
      approveRequest(
        {
          team_id: this.state.team_info.id,
          mode: reject == 'reject' ? 'reject' : 'accept'
        },
        st => {
          if (st) {
            this.fetchTeam();
          }
        }
      )
    );
  }

  invite_user(event) {
    event.preventDefault();
    this.props.dispatch(
      inviteToTeam(
        {
          username: this.state.new_invite_user_name,
          team_id: this.state.team_info.id
        },
        st => {
          if (st) {
            this.setState(
              {
                new_invite_user_name: ''
              },
              () => {
                this.fetchTeam();
              }
            );
          }
        }
      )
    );
    setTimeout(() => {}, 1000);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    this.fetchTeam();
  }

  fetchTeam() {
    fetch('/api/teams/single/' + this.props.params.team_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              team_info: json.item
            },
            () => {
              this.fetchGame();
            }
          );
        }
      });
  }

  fetchGame() {
    if (!this.state.team_info.ladder) {
      return;
    }
    fetch('/api/games/single/' + this.state.team_info.ladder.game_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              game: json.item
            },
            () => {
              this.fetchMatches();
            }
          );
        }
      });
  }

  fetchMatches() {
    if (!this.state.team_info.ladder) {
      return;
    }
    fetch('/api/matches/matches_of_team/?team_id=' + this.props.params.team_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              match_played: json.items ? json.items : []
            },
            () => {
              // this.fetchMatches();
            }
          );
        }
      });
  }

  handleCoverFile = event => {
    this.setState(
      {
        cover_image_select: event.target.files[0],
        loaded: 0
      },
      () => {
        this.askFile('cover_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_cover_pic: data.file,
              new_cover_pic_saved: false
            });
          }
        });
      }
    );
  };

  doSaveCoverPic(event) {
    if (!this.state.new_cover_pic) {
      return;
    }

    event.preventDefault();
    this.props.dispatch(
      teamPic(
        {
          cover_picture: this.state.new_cover_pic
        },
        this.state.team_info.id
      )
    );
    const team = this.state.team_info;
    team.cover_picture = this.state.new_cover_pic;
    this.setState({
      team_info: team,
      new_cover_pic: '',
      new_cover_pic_saved: false
    });
  }

  askFile(cls, cb) {
    // console.log('here');
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          });
        }
      })
      .then(res => {
        // console.log(res.data);

        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured.');
        // console.log(err);
      });
  }

  currentUserInTeam() {
    return this.state.team_info.team_creator == this.props.user.id
      ? true
      : false;
  }

  render() {
    const divStyle = this.state.new_cover_pic
      ? {
          backgroundImage: "url('" + this.state.new_cover_pic + "')"
        }
      : this.state.team_info && this.state.team_info.cover_picture
      ? {
          backgroundImage: 'url(' + this.state.team_info.cover_picture + ')'
        }
      : {};

    return (
      <div>
        <section
          className="page_title_bar less_padding"
          id="is_top"
          style={divStyle}
        >
          {this.props.user && this.currentUserInTeam() ? (
            <div className="update_btn cover">
              <label htmlFor="cover_image_select">
                <i className="fa fa-edit" /> upload cover
              </label>

              {this.state.new_cover_pic && !this.state.new_cover_pic_saved ? (
                <button
                  onClick={event => {
                    this.doSaveCoverPic(event);
                  }}
                  type="button"
                >
                  <i className="fa fa-save" /> save new cover
                </button>
              ) : (
                false
              )}

              <input
                type="file"
                name="cover_image_select"
                id="cover_image_select"
                className="hidden hide"
                accept="image/gif, image/jpeg, image/png"
                onChange={this.handleCoverFile.bind(this)}
              />
            </div>
          ) : (
            false
          )}
          <div className="container">
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12">
                <div className="game_pic_tournament">
                  <img
                    className="img-fluid profile_pic_outline"
                    src="/images/team_bg.png"
                  />
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>{this.state.team_info.title}</h3>
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span>
                          <i className="fa fa-gamepad" aria-hidden="true" />
                          {this.state.game.title}
                        </span>
                        <p>Game </p>
                      </div>
                      <div className="col-md-4">
                        <span>
                          <i className="fa fa-trophy" aria-hidden="true" />
                          {this.state.team_info.ladder &&
                            this.state.team_info.ladder.title}
                        </span>
                        <p>Ladder </p>
                      </div>
                      <div className="col-md-4">
                        <span>
                          <i className="fa fa-users" aria-hidden="true" />
                          Min:{' '}
                          {this.state.team_info.ladder
                            ? this.state.team_info.ladder.min_players
                            : ''}{' '}
                          | Max:{' '}
                          {this.state.team_info.ladder
                            ? this.state.team_info.ladder.max_players
                            : ''}
                        </span>
                        <p>Players </p>
                      </div>

                      {/*<div className="col-md-4">
                      <span>
                        <i className="fa fa-eye" aria-hidden="true" /> 739
                      </span>
                      <p>Profile Views </p>
                    </div>*/}
                    </div>
                    {this.props.user &&
                    this.state.team_info.team_creator == this.props.user.id ? (
                      <Link
                        to={
                          '/matchfinder/new/' +
                          this.state.team_info.ladder.id +
                          '/' +
                          this.state.team_info.id
                        }
                        className="btn btn-default bttn_submit mw_200"
                      >
                        Create a match
                      </Link>
                    ) : (
                      false
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <span className="pull-right">
                      {this.props.user && this.props.user.id ==
                        this.state.team_info.team_creator && (
                        <button
                          className="is_link btn"
                          onClick={() => {
                            this.setState({
                              is_edit_mode: !this.state.is_edit_mode
                            });
                          }}
                        >
                          <i className="fa fa-edit" /> edit
                        </button>
                      )}
                    </span>
                    <i className="fa fa-users" aria-hidden="true" /> SQUAD
                  </h5>

                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        {this.state.is_edit_mode && <th>{'remove'}</th>}
                        <th>Username</th>
                        <th>Role</th>
                        <th>Gamer Tag</th>
                        <th>Eligible</th>
                        <th>Date Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.team_info.team_users.map((team_user, i) => {
                        // console.log(team_user.user_info.id, this.props.user.id);
                        return (
                          <tr key={team_user.id}>
                            {this.state.is_edit_mode && (
                              <td>
                                {this.props.user && team_user.user_info.id !=
                                  this.props.user.id && (
                                  <input type="checkbox" />
                                )}
                              </td>
                            )}
                            <td>
                              <Link to={'/u/' + team_user.user_info.username}>
                                {team_user.user_info.username}
                              </Link>
                            </td>

                            <td>
                              {team_user.user_id ==
                              this.state.team_info.team_creator
                                ? 'Leader'
                                : 'Member'}
                            </td>
                            <td>
                              {this.state.team_info &&
                              this.state.team_info.ladder &&
                              this.state.team_info.ladder.gamer_tag
                                ? team_user.user_info[
                                    'gamer_tag_' +
                                      this.state.team_info.ladder.gamer_tag
                                  ]
                                : ''}
                            </td>
                            <td>
                              {this.state.team_info &&
                              this.state.team_info.ladder &&
                              this.state.team_info.ladder.gamer_tag &&
                              team_user.user_info[
                                'gamer_tag_' +
                                  this.state.team_info.ladder.gamer_tag
                              ] ? (
                                <span className="text-success">
                                  <img
                                    className="icon_size"
                                    src="/images/controller-green.svg"
                                  />{' '}
                                  Eligible
                                </span>
                              ) : (
                                <span className="text-danger">
                                  <img
                                    className="icon_size"
                                    src="/images/controller-red.svg"
                                  />{' '}
                                  Not Eligible
                                </span>
                              )}
                            </td>
                            <td>
                              {team_user.accepted
                                ? moment(team_user.created_at).format('lll')
                                : 'Not Yet Accepted'}{' '}
                              {this.props.user && !team_user.accepted &&
                              team_user.user_id == this.props.user.id ? (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={event => {
                                    this.approveRequest(event);
                                  }}
                                >
                                  Accept
                                </button>
                              ) : (
                                false
                              )}
                              { this.props.user && !team_user.accepted &&
                              team_user.user_id == this.props.user.id ? (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={event => {
                                    this.approveRequest(event, 'reject');
                                  }}
                                >
                                  Reject
                                </button>
                              ) : (
                                false
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {this.state.is_edit_mode && (
                    <button disabled className="btn btn-danger sm">
                      Remove from squad
                    </button>
                  )}
                </div>

                { this.props.user && this.state.team_info.team_creator == this.props.user.id &&
                parseInt(this.state.team_info.ladder.max_players) >
                  parseInt(this.state.team_info.team_users.length) ? (
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">Invite A User</h5>
                    <Messages messages={this.props.messages} />
                    <form
                      onSubmit={this.invite_user.bind(this)}
                      className="row margin-40"
                    >
                      <div className="col-md-4">
                        <div className="form-group">
                          <input
                            type="text"
                            id="new_invite_user_name"
                            className="form-control"
                            required=""
                            placeholder="Enter Username"
                            name="new_invite_user_name"
                            value={this.state.new_invite_user_name}
                            onChange={this.handleChange.bind(this)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <button
                          type="submit"
                          disabled={this.state.new_invite_user_name == ''}
                          className="btn btn-sm btn-primary"
                        >
                          Invite User
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  false
                )}

                <h5 className="prizes_desclaimer">RECORD BY MATCHES</h5>

                <table className="table table-striped table-ongray table-hover">
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Opponent</th>
                      <th>Status</th>

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
                          <td>
                            {match.team_1_id == this.state.team_info.id ? (
                              <Link to={'/teams/view' + match.team_1_id}>
                                {match.team_1_info.title}
                              </Link>
                            ) : (
                              <Link to={'/teams/view' + match.team_2_id}>
                                {match.team_2_info.title}
                              </Link>
                            )}
                          </td>

                          <td>{match.status}</td>

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
            </div>
          </div>
        </section>
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
// export default SingleThread;
export default connect(mapStateToProps)(TeamInfo);
