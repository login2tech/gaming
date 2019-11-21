import React from 'react';
import {connect} from 'react-redux';
const moment = require('moment');
import {Link} from 'react-router';
import {sendMsg} from '../actions/orders';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matches: {['game_' + props.params.id]: []},
      done_matches: [],
      new_chat_msg: '',
      min_time: false,
      chats: [],
      leaderboards: {}
    };
  }

  matchLink(orign) {
    if (this.props.user) {
      return orign;
    }
    return '/login';
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  newMsgSubmit(e) {
    e.preventDefault();
    if (this.state.new_chat_msg.trim() == '') {
      return;
    }
    // e.preventDefault();
    const {chats} = this.state;
    // chats.push({
    //   user: this.props.user,
    //   msg: this.state.new_chat_msg,
    //   id: Math.random()
    // });

    this.props.dispatch(
      sendMsg(
        {
          from_id: this.props.user.id,
          game_id: this.props.params.id,
          msg: this.state.new_chat_msg
        },
        chat => {
          if (chat) {
            chat.user = this.props.user;
            chats.push(chat);
          }
          this.setState(
            {
              new_chat_msg: '',
              chats: chats
            },
            () => {
              window.setTimeout(function() {
                const a = jQuery('.msg_history');
                a[0].scrollTop = a[0].scrollHeight;
              }, 100);
            }
          );
        }
      )
    );
  }

  componentDidMount() {
    this.fetchGame();
    //
  }

  fetchGame() {
    fetch('/api/games/single/' + this.props.params.id)
      .then(res => res.json())
      .then(json => {
        if (!json.ok) {
          this.fetchUpcomingMatches();
          return;
        }
        this.setState(
          {
            game: json.item
          },
          () => {
            this.fetchUpcomingMatches();
          }
        );
      });
  }

  fetchUpcomingMatches() {
    let str = '';
    // str;
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

  fetchLeaderBoards() {
    let str = '';
    // str;
    if (this.props.params && this.props.params.id) {
      str = '?&game_id=' + this.props.params.id;
    }
    fetch('/api/games/leaderboards' + str)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const items = json.items;
          const leaderboards = {};
          // const ladders = [];
          // console.log(ladders, ladders);
          let k = false;
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!leaderboards['l_' + item.ladder_id]) {
              leaderboards['l_' + item.ladder_id] = {
                ladder: item.ladder
              };
              if (!k) {
                k = 'l_' + item.ladder_id;
              }
              // ladders.push(item.ladder);
            }
            if (!leaderboards['l_' + item.ladder_id]['u_' + item.team_id]) {
              item.team.gravatar = '';
              leaderboards['l_' + item.ladder_id]['u_' + item.team_id] = {
                team: item.team,
                wins: 0,
                loss: 0
              };
            }
            leaderboards['l_' + item.ladder_id][
              'u_' + item.team_id
            ].wins += item.wins ? item.wins : 0;
            leaderboards['l_' + item.ladder_id][
              'u_' + item.team_id
            ].loss += item.loss ? item.loss : 0;
          }
          this.setState(
            {
              is_loaded_4: true,
              leaderboards: leaderboards,
              active_leaderboard: k
            },
            () => {}
          );
        }
      });
  }

  reloadChats() {
    let str = 'game_id=' + this.props.params.id;
    if (this.state.min_time) {
      str += '&min_time=' + this.state.min_time;
    }
    fetch('/api/messaging/list?' + str)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          let chats;
          if (json.chats && json.chats.length) {
            chats = this.state.chats.concat(json.chats);
          } else {
            chats = this.state.chats;
          }
          chats = chats.filter(
            (chat, index, self) =>
              index === self.findIndex(t => t.id === chat.id)
          );

          this.setState(
            {
              chats: chats,
              min_time: json.fetched_on ? json.fetched_on : false
            },
            () => {
              window.setTimeout(function() {
                const a = jQuery('.msg_history');
                a[0].scrollTop = a[0].scrollHeight;
              }, 100);
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
              setInterval(this.reloadChats.bind(this), 1000);
              this.fetchLeaderBoards();
            }
          );
        }
      });
  }

  compareByRate(a, b) {
    if (a.rate < b.rate) {
      return 1;
    }
    if (a.rate > b.rate) {
      return -1;
    }
    return 0;
  }

  renderLeaderBoard() {
    const {leaderboards, active_leaderboard} = this.state;
    if (!leaderboards || !leaderboards[active_leaderboard]) {
      return false;
    }
    const data = [];
    const keys = Object.keys(leaderboards[active_leaderboard]);
    for (let i = 0; i < keys.length; i++) {
      const team = keys[i];
      if (team == 'ladder') {
        continue;
      }
      data.push({
        idx: i,
        username: leaderboards[active_leaderboard][team].team.title,
        wins: leaderboards[active_leaderboard][team].wins,
        loss: leaderboards[active_leaderboard][team].loss,
        rate: parseFloat(
          (100 * leaderboards[active_leaderboard][team].wins) /
            (leaderboards[active_leaderboard][team].loss +
              leaderboards[active_leaderboard][team].wins)
        )
      });
    }
    data.sort(this.compareByRate);
    return (
      <tbody>
        {data.map((item, idx) => {
          // console.log(leaderboards[active_leaderboard][user]);
          return (
            <tr key={item.idx}>
              <td>{item.idx}</td>
              <td>
                <Link to={'/teams/view/' + item.id}>{item.username}</Link>
              </td>
              <td className="text-success">{item.wins}</td>
              <td className="text-danger">{item.loss}</td>
              <td>{item.rate.toFixed(2)}%</td>
            </tr>
          );
        })}
      </tbody>
    );
  }

  render() {
    const {leaderboards, active_leaderboard} = this.state;
    const game_id = this.props.params.id;
    return (
      <div>
        <section
          className="page_title_bar"
          style={
            this.state.game
              ? {backgroundImage: "url('" + this.state.game.banner_url + "')"}
              : {}
          }
        >
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
                    <div className="chat_box_message_list msg_history">
                      {this.state.chats.map((chat, i) => {
                        if (!chat.user) {
                          chat.user = chat.from;
                        }
                        if (!chat.user) {
                          chat.user = {id: '', username: ''};
                        }
                        const image_url =
                          chat.user && chat.user.profile_picture
                            ? chat.user.profile_picture
                            : 'https://ui-avatars.com/api/?size=30&name=' +
                              (chat.user ? chat.user.first_name : ' ') +
                              ' ' +
                              (chat.user ? chat.user.last_name : ' ') +
                              '&color=223cf3&background=000000';

                        return (
                          <div key={chat.id} className="single_chat">
                            <span className="chat_user_image">
                              <img src={image_url} />
                            </span>

                            <span className="chat_user_name">
                              <Link to={'/u/' + chat.user.username}>
                                {chat.user.username}
                              </Link>
                            </span>

                            <span className="chat_msg">{chat.msg}</span>
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
                          placeholder="Type your message and press enter key to send a message.."
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
                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Starts At</th>
                          <th>Type</th>
                          <th>Fee</th>
                          <th>Players</th>
                          <th> </th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.matches &&
                          this.state.matches['game_' + game_id] &&
                          this.state.matches['game_' + game_id].map(
                            (match, i) => {
                              if (match.status == 'expired') {
                                return false;
                              }
                              return (
                                <tr
                                  key={match.id}
                                  className="tournament-box"
                                  style={{background: '#27204d'}}
                                >
                                  <td>
                                    <Link
                                      to={this.matchLink('/m/' + match.id)}
                                      className="tournament-name"
                                    >
                                      {match.ladder.title}
                                    </Link>
                                  </td>
                                  <td>
                                    {moment(match.starts_at).format('lll')}
                                  </td>
                                  <td>
                                    {match.match_type == 'paid'
                                      ? 'PAID'
                                      : 'FREE'}
                                  </td>
                                  <td>
                                    {match.match_type == 'paid'
                                      ? '$ ' + match.match_fee
                                      : '--'}
                                  </td>

                                  <td className="col-item">
                                    {match.match_players}v{match.match_players}
                                  </td>
                                  <td>
                                    <Link to={this.matchLink('/m/' + match.id)}>
                                      Accept Match
                                    </Link>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  <h4>Recent Matches</h4>

                  <div className="table_wrapper">
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
                          if (match.status == 'expired') {
                            return false;
                          }
                          if (!match.team_2_info) {
                            return false;
                          }
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
                                <Link
                                  to={'/teams/view/' + match.team_1_info.id}
                                >
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
              </div>
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  <h4>Leaderboard</h4>
                  <div className="btn-group">
                    {Object.keys(leaderboards).map((ladder, idx) => {
                      return (
                        <button
                          onClick={() => {
                            this.setState({
                              active_leaderboard: ladder
                            });
                          }}
                          className={
                            'btn ' +
                            (active_leaderboard == ladder ? ' btn-primary' : '')
                          }
                          key={ladder}
                        >
                          {leaderboards[ladder].ladder.title}
                        </button>
                      );
                    })}
                  </div>
                  <br />
                  <br />
                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <td>Game Rank</td>
                          <td>Team</td>
                          <td>Wins</td>
                          <td>Loss</td>
                          <td>Win Rate</td>
                        </tr>
                      </thead>
                      {this.renderLeaderBoard()}
                    </table>
                  </div>
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
