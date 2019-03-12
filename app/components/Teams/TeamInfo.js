import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {inviteToTeam, approveRequest} from '../../actions/team';
import Messages from '../Modules/Messages';

class TeamInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      team_info: {ladder: {}, team_users: []},
      game: {},
      match_played: [],
      new_invite_user_name: ''
    };
  }
  approveRequest(event) {
    event.preventDefault();
    this.props.dispatch(
      approveRequest(
        {
          team_id: this.state.team_info.id
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
              // this.fetchGame();
            }
          );
        }
      });
  }

  render() {
    return (
      <div>
        <section className="page_title_bar less_padding">
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
                          <i className="fa fa-bar-chart" aria-hidden="true" />
                          {this.state.game.title}
                        </span>
                        <p>Game </p>
                      </div>
                      <div className="col-md-4">
                        <span>
                          <i className="fa fa-bar-chart" aria-hidden="true" />
                          {this.state.team_info.ladder &&
                            this.state.team_info.ladder.title}
                        </span>
                        <p>Ladder </p>
                      </div>
                      <div className="col-md-4">
                        <span>
                          <i className="fa fa-bar-chart" aria-hidden="true" />
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
                    <i className="fa fa-users" aria-hidden="true" /> ROSTER
                  </h5>

                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Date Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.team_info.team_users.map((team_user, i) => {
                        return (
                          <tr key={team_user.id}>
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
                              {team_user.accepted
                                ? moment(team_user.created_at).format('lll')
                                : 'Not Yet'}
                              {!team_user.accepted &&
                              team_user.user_id == req.user.id ? (
                                <button
                                  onClick={event => {
                                    this.approveRequest(event);
                                  }}
                                >
                                  Accept
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
                </div>

                {this.state.team_info.team_creator == this.props.user.id &&
                parseInt(this.state.team_info.ladder.max_players) >
                  parseInt(this.state.team_info.team_users) ? (
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
