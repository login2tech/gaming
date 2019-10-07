import React from 'react';
import {connect} from 'react-redux';
const moment = require('moment');
import {Link} from 'react-router';
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matches: {[props.params.id]: []},
      done_matches: [],
      new_chat_msg: '',
      chats: [
        {
          user: {username: 'vasuchawla', id: 1},
          id: 1,
          msg: 'hi there how are you'
        },
        {user: {username: 'vasuchawla', id: 1}, id: 2, msg: 'hello hello hello'}
      ]
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  newMsgSubmit(e) {
    e.preventDefault();
    const {chats} = this.state;
    chats.push({
      user: this.props.user,
      msg: this.state.new_chat_msg,
      id: Math.random()
    });
    this.setState({
      new_chat_msg: '',
      chats: chats
    });
  }

  componentDidMount() {
    this.fetchUpcomingMatches();
  }
  fetchUpcomingMatches() {
    let str = '';
    if (this.props.params && this.props.params.id) {
      str = '?&filter_id=' + this.props.params.id;
    }
    fetch('/api/matches/upcoming' + str)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded_1: true,
              matches: json.items,
              total_upcoming: json.total_upcoming
            },
            () => {
              this.fetchRecentMatches();
            }
          );
        }
      });
  }

  fetchRecentMatches() {
    let str = '';
    if (this.props.params && this.props.params.id) {
      str = '?&filter_id=' + this.props.params.id;
    }
    fetch('/api/matches/recent' + str)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded_2: true,
              done_matches: json.items,
              total_done: json.total_done
            },
            () => {
              this.fetch;
            }
          );
        }
      });
  }

  render() {
    const game_id = this.props.params.id;
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>{this.props.params.title}</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  <h4>Chatbox</h4>
                  <div className="chat_box">
                    <div className="chat_box_message_list">
                      {this.state.chats.map((chat, i) => {
                        return (
                          <div key={chat.id} className="single_chat">
                            <span className="chat_user_image">
                              <img src="" />
                            </span>

                            <span className="chat_user_name">
                              <Link to={'/u/' + chat.user.username}>
                                @vasuchawla
                              </Link>
                            </span>

                            <span className="chat_msg">
                              hi there, how are you?
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="chat_box_message_post">
                      <form onSubmit={this.newMsgSubmit.bind(this)}>
                        <input
                          type="text"
                          className="form-control"
                          name="new_chat_msg"
                          id="new_chat_msg"
                          value={this.state.new_chat_msg}
                          onChange={this.handleChange.bind(this)}
                        />
                        <button style={{display: 'none'}} type="submit">
                          Submit
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  <h4>Matchfinder</h4>
                  {this.state.is_loaded_1 && this.state.total_upcoming < 1 ? (
                    <div className="alert alert-warning">
                      There are no active matches. Please check back later or
                      start a new match
                    </div>
                  ) : (
                    false
                  )}
                  {!this.state.is_loaded_1 ? (
                    <div className="text-center">
                      <span className="fa fa-spin fa-spinner" />
                    </div>
                  ) : (
                    false
                  )}
                  <ul
                    id="upcoming-tournament"
                    className="tournament-list active"
                  >
                    {this.state.matches &&
                      this.state.matches[game_id] &&
                      this.state.matches[game_id].map((match, i) => {
                        return (
                          <li
                            key={match.id}
                            className="tournament-box"
                            style={{background: '#27204d'}}
                          >
                            <div className="tournament-body">
                              <Link
                                to={this.matchLink('/m/' + match.id)}
                                className="tournament-name"
                              >
                                {match.ladder.title}
                              </Link>

                              <span className="date">
                                {moment(match.starts_at).format('lll')}
                              </span>
                              <span className="date">
                                Starts {moment(match.starts_at).fromNow()}
                              </span>
                            </div>

                            <div className="tournament-footer">
                              <div className="col">
                                <div className="col-item">
                                  <h5>Status</h5>
                                  <p>{match.status}</p>
                                </div>
                                <div className="col-item">
                                  <h5>TYPE</h5>
                                  <p>
                                    {match.match_type == 'paid'
                                      ? 'CASHOUT'
                                      : 'LADDER'}
                                  </p>
                                </div>
                                <div className="col-item">
                                  <h5>Prize pool</h5>
                                  <p>
                                    {match.match_type == 'paid'
                                      ? '$ ' + match.match_fee + ' USD'
                                      : '--'}
                                  </p>
                                </div>
                                <div className="col-item">
                                  <h5>Players</h5>
                                  <p>
                                    {match.match_players}v{match.match_players}
                                  </p>
                                </div>
                              </div>

                              <div className="col align-right">
                                <Link
                                  to={this.matchLink('/m/' + match.id)}
                                  className="btn-default"
                                >
                                  Accept Match
                                </Link>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  <h4>Recent Matches</h4>

                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        <th>Match</th>
                        <th>Team 1</th>
                        <th>Team 2</th>
                        <th>Date</th>
                        <th>Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.done_matches.map((match, i) => {
                        let wl_1 = false;
                        let wl_2 = false;
                        if (match.result) {
                          if (match.result == 'team_1') {
                            wl_1 = <span className="text-success"> W</span>;
                            wl_2 = <span className="text-danger"> L</span>;
                          } else if (match.result == 'team_2') {
                            wl_2 = <span className="text-success"> W</span>;
                            wl_1 = <span className="text-danger"> L</span>;
                          }
                        }

                        return (
                          <tr key={match.id}>
                            <td>
                              <Link to={'/m/' + match.id}>#{match.id}</Link>
                            </td>
                            <td>
                              <Link to={'/teams/view/' + match.team_1_info.id}>
                                {match.team_1_info.title}
                              </Link>
                              {wl_1}
                            </td>
                            <td>
                              {match.team_2_info ? (
                                <>
                                  <Link
                                    to={'/teams/view/' + match.team_2_info.id}
                                  >
                                    {match.team_2_info.title}
                                  </Link>
                                  {wl_2}
                                </>
                              ) : (
                                ' '
                              )}
                            </td>

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
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  <h4>Leaderboard</h4>
                </div>
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

export default connect(mapStateToProps)(Game);
