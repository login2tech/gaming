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
      leaderboards: {},
      first_load_done: false,
      is_loaded_4: false,
      is_loaded_1: false
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
      str += '&filter_id=' + this.props.params.id;
    }
    if (this.state.selected_ladder && this.props.params.id) {
      str += '&filter_ladder=' + this.state.selected_ladder;
    }

    fetch('/api/matches/upcoming?1' + str)
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
      str += ' &game_id=' + this.props.params.id;
    }
    //
    if (this.state.selected_ladder && this.props.params.id) {
      str += '&filter_ladder=' + this.state.selected_ladder;
    }

    fetch('/api/games/leaderboards?1' + str)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const items = json.items;
          const leaderboards = {};
          // const ladders = [];
          let k = false;
          for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!leaderboards['u_' + item.team_id]) {
              item.team.gravatar = '';
              leaderboards['u_' + item.team_id] = {
                team: item.team,
                wins: 0,
                loss: 0
              };
            }
            leaderboards['u_' + item.team_id].wins += item.wins ? item.wins : 0;
            leaderboards['u_' + item.team_id].loss += item.loss ? item.loss : 0;
          }
          k = 'l_' + this.state.selected_ladder;
          this.setState(
            {
              is_loaded_4: true,
              loading_3: false,
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
              if (this.state.first_load_done) {
                return;
              } else {
                window.setTimeout(function() {
                  const a = jQuery('.msg_history');
                  a[0].scrollTop = a[0].scrollHeight;
                }, 100);
                this.setState({
                  first_load_done: true
                });
              }
            }
          );
        }
      });
  }

  fetchRecentMatches() {
    let str = '';
    if (this.props.params && this.props.params.id) {
      str += '?&filter_id=' + this.props.params.id;
    }
    if (this.state.selected_ladder && this.props.params.id) {
      str += '&filter_ladder=' + this.state.selected_ladder;
    }
    fetch('/api/matches/recent?1' + str)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded_2: true,
              loading_2: false,
              done_matches: json.items,
              total_done: json.total_done
            },
            () => {
              setInterval(this.reloadChats.bind(this), 2000);
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
    const {leaderboards} = this.state;
    if (!leaderboards) {
      return false;
    }
    const data = [];
    const keys = Object.keys(leaderboards);
    for (let i = 0; i < keys.length; i++) {
      const team = keys[i];
      if (team == 'ladder') {
        continue;
      }
      data.push({
        idx: i,
        id: leaderboards[team].team.id,
        username: leaderboards[team].team.title,
        profile_picture: leaderboards[team].team.profile_picture,
        wins: leaderboards[team].wins,
        loss: leaderboards[team].loss,
        rate: parseFloat(
          (100 * leaderboards[team].wins) /
            (leaderboards[team].loss + leaderboards[team].wins)
        )
      });
    }
    data.sort(this.compareByRate);
    return (
      <tbody>
        {data.map((item, idx) => {
          const image_url =
            item && item.profile_picture
              ? item.profile_picture
              : 'https://ui-avatars.com/api/?size=30&name=' +
                (item ? item.username : '') +
                '&color=124afb&background=fff';

          return (
            <tr key={item.idx}>
              <td>{idx + 1}</td>
              <td>
                <Link className="avatar_img_r" to={'/teams/view/' + item.id}>
                  <img src={image_url} /> {item.username}
                </Link>
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

  getLadders() {
    if (!this.state.game) {
      return [];
    }

    const ladders = this.state.game.ladders;
    const platforms = ladders.map(function(item) {
      return item.platform;
    });

    const unique_platforms = [];
    const unique_platforms_d = [];

    for (let i = 0; i < platforms.length; i++) {
      if (unique_platforms_d.indexOf(platforms[i]) > -1) {
        //
      } else {
        unique_platforms.push({
          name: platforms[i],
          is_platform: true,
          id: platforms[i]
        });
        unique_platforms_d.push(platforms[i]);
        for (let j = 0; j < ladders.length; j++) {
          if (ladders[j].platform == platforms[i]) {
            unique_platforms.push({
              name: ladders[j].title,
              is_ladder: true,
              id: ladders[j].id
            });
          }
        }
      }
    }
    return unique_platforms;
  }

  getPlatformIcon(name) {
    if (!name) {
      return;
    }
    name = name.toLowerCase();
    if (name.indexOf('xbox') > -1 || name.indexOf('x box') > -1) {
      return <span className="fab fa-xbox" />;
    }
    if (name.indexOf('playstation') > -1) {
      return <span className="fab fa-playstation" />;
    } else if (name.indexOf('pc') > -1) {
      return <span className="fa fa-desktop" />;
    } else if (name.indexOf('crossplatform') > -1) {
      return <span className="fa fa-cubes" />;
    }
    return false;
  }

  filterMatches(item) {
    const obj = {
      is_loaded_1: false,
      is_loaded_4: false,
      loading_2: true,
      loading_3: true,
      selected_ladder_name: false,
      selected_ladder: false
    };
    if (item == 'none') {
      // obj = {};
    } else {
      obj.selected_ladder = item.id;
      obj.selected_ladder_name = item.name;
    }
    this.setState(obj, this.fetchUpcomingMatches);
  }

  renderButton1 = cls => (
    <Link
      to={'/match/new/g/' + this.props.params.id}
      className={'btn btn-default bttn_submit' + cls}
    >
      Create Match
    </Link>
  );
  renderButton2 = cls => (
    <Link
      to={
        this.props.user
          ? '/u/' +
            this.props.user.username +
            '/teams/new/g/' +
            this.props.params.id
          : '/login'
      }
      className={'btn btn-default bttn_submit' + cls}
    >
      Create Team
    </Link>
  );

  renderButton4 = cls => (
    <div className={'dropdown' + cls}>
      <button
        className="btn btn-default bttn_submit dropdown-toggle"
        type="button"
        id="dropdownMenuButton"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {this.state.selected_ladder_name ? (
          this.state.selected_ladder_name
        ) : (
          <>
            Filter <span className="d-md-inline-block d-none"> by ladder</span>
          </>
        )}
      </button>
      <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
        {this.state.selected_ladder_name ? (
          <a
            className={'dropdown-item'}
            href="#"
            onClick={e => {
              e.preventDefault();
              this.filterMatches('none');
            }}
          >
            All Ladders
          </a>
        ) : (
          false
        )}
        <br />
        {this.getLadders().map((item, i) => {
          return (
            <a
              className={
                'dropdown-item' +
                (item.is_platform ? ' disabled' : '') +
                (item.is_ladder ? ' is_ladder_item' : '')
              }
              href="#"
              onClick={e => {
                e.preventDefault();
                if (item.is_ladder) {
                  this.filterMatches(item);
                }
              }}
              key={item.id}
              disabled={item.is_platform}
            >
              {item.name}{' '}
              {item.is_platform ? this.getPlatformIcon(item.name) : false}
            </a>
          );
        })}
      </div>
    </div>
  );
  renderButton3 = cls => (
    <Link
      to={'/game-rules/' + this.props.params.id + '/' + this.props.params.title}
      className={'btn btn-default bttn_submit' + cls}
    >
      Rules
    </Link>
  );
  renderButtonSet1() {
    return (
      <>
        {this.renderButton1(' fl-right dib mw_200')}{' '}
        {this.renderButton2(' fl-right dib mw_200')}
      </>
    );
  }

  renderButtonSet2(cls) {
    return (
      <>
        {this.renderButton3(' fl-right dib mw_200')}{' '}
        {this.renderButton4(' fl-right dib mw_200')}
      </>
    );
  }

  render() {
    // const {leaderboards, active_leaderboard} = this.state;
    const game_id = this.props.params.id;
    return (
      <div>
        <section
          className={
            'd-md-none page_title_bar is_single_game_header gm noblend' +
            (this.state.game && this.state.game.banner_url
              ? ' has_game_banner'
              : ' ')
          }
          style={
            this.state.game
              ? {
                  minHeight: 250,
                  paddingBottom: 10,
                  display: 'flex',
                  backgroundImage:
                    "url('" + this.state.game.mobile_banner_url + "')"
                }
              : {minHeight: 250, paddingBottom: 10, display: 'flex'}
          }
        >
          <div className="container-fluid d-flex">
            <div
              className="row no-gutters full_width"
              style={{
                alignSelf: 'flex-end'
              }}
            >
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-right ">
                  <h3> </h3>
                </div>

                <div
                  className="list_pad mobil-game-actions game_actions banner_actions d-flex p-0"
                  style={{
                    alignSelf: 'flex-end',
                    flexDirection: 'row',

                    justifyContent: 'flex-end'
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'inline-block'
                    }}
                  >
                    {this.renderButtonSet1()}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: 'inline-block'
                    }}
                  >
                    {this.renderButtonSet2()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={'d-none d-md-block page_title_bar  gm noblend'}
          style={{minHeight: 250, padding: 0}}
        >
          <div className="container-fluid">
            <div className="row">
              <div
                className="col-md-8 col-sm-12 col-xs-12 is_single_game_header_desk"
                style={
                  this.state.game
                    ? {
                        minHeight: 250,
                        paddingTop: 20,
                        paddingBottom: 10,
                        backgroundImage:
                          "url('" + this.state.game.banner_url + "')"
                      }
                    : {minHeight: 250, paddingTop: 20, paddingBottom: 10}
                }
              >
                <div className="section-headline white-headline text-right d-none d-md-inline-block">
                  <h3> </h3>
                </div>
              </div>
              <div className="col-md-4 game_actions">
                <div className="row full_width">
                  <div className="col-6">
                    {this.renderButton1(' full_width')}
                  </div>
                  <div className="col-6">
                    {this.renderButton2(' full_width')}
                  </div>
                </div>
                <div className="row full_width">
                  <div className="col-6">
                    {this.renderButton3(' full_width')}
                  </div>
                  <div className="col-6">
                    {this.renderButton4(' full_width')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part" style={{paddingTop: 30}}>
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-sm-12 d-md-none d-inline-block col-xs-12 pos-rel">
                <div>
                  <h4 className="capitalize">
                    {this.props.params.title} Matchfinder
                  </h4>
                  {this.state.is_loaded_1 && this.state.total_upcoming < 1 ? (
                    <div className="alert alert-warning">
                      There are no active matches. Please check back later or
                      start a new match
                    </div>
                  ) : (
                    false
                  )}
                  {this.state.is_loaded_1 ? (
                    false
                  ) : (
                    <div className="text-center ym_loader_wrap">
                      <span className="fa fa-spin fa-spinner" />
                    </div>
                  )}
                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th className="h-o-p  d-none">Match</th>
                          <th>Starts At</th>

                          <th style={{width: '15%'}}>Fee</th>
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
                                  <td className="h-o-p  d-none">
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
                                    {match.match_type == 'free'
                                      ? 'FREE'
                                      : match.match_type == 'credits' ||
                                        match.match_type == 'credit'
                                        ? match.match_fee + ' credits'
                                        : match.match_type == 'cash'
                                          ? '$' + match.match_fee
                                          : ' '}
                                  </td>

                                  <td className="col-item">
                                    {match.match_players}v{match.match_players}
                                  </td>
                                  <td>
                                    <Link to={this.matchLink('/m/' + match.id)}>
                                      Accept{' '}
                                      <span className="h-o-p">Match</span>
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
                        <button type="submit" className="cht_send_btn">
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-sm-12 col-xs-12 pos-rel">
                <div>
                  {this.state.is_loaded_4 ? (
                    false
                  ) : (
                    <div className="text-center ym_loader_wrap">
                      <span className="fa fa-spin fa-spinner" />
                    </div>
                  )}
                  <h4>Leaderboards</h4>
                  {/*<div className="btn-group" style={{float: 'right'}}>
                    Object.keys(leaderboards).map((ladder, idx) => {
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
                      })
                    </div>*/}
                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <td>Rank</td>
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

            <div className="row">
              <div className="col-md-6 col-sm-12 d-none d-md-inline-block col-xs-12 pos-rel">
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
                  {this.state.is_loaded_1 ? (
                    false
                  ) : (
                    <div className="text-center ym_loader_wrap">
                      <span className="fa fa-spin fa-spinner" />
                    </div>
                  )}
                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th className="h-o-p  d-none">Match</th>
                          <th>Starts At</th>
                          <th style={{width: '15%'}}>Fee</th>
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
                                  <td className="h-o-p  d-none">
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
                                    {match.match_type == 'free'
                                      ? 'FREE'
                                      : match.match_type == 'credits' ||
                                        match.match_type == 'credit'
                                        ? match.match_fee + ' credits'
                                        : match.match_type == 'cash'
                                          ? '$' + match.match_fee
                                          : ' '}
                                  </td>

                                  <td className="col-item">
                                    {match.match_players}v{match.match_players}
                                  </td>
                                  <td>
                                    <Link to={this.matchLink('/m/' + match.id)}>
                                      Accept{' '}
                                      <span className="h-o-p">Match</span>
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
              <div className="col-md-6 col-sm-12 col-xs-12 pos-rel">
                <div>
                  {this.state.is_loaded_2 ? (
                    false
                  ) : (
                    <div className="text-center ym_loader_wrap">
                      <span className="fa fa-spin fa-spinner" />
                    </div>
                  )}
                  <h4>Recent Matches</h4>

                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th className="h-o-p  d-none">Match</th>
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
                              <td className="h-o-p  d-none">
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
                                <Link to={'/m/' + match.id}>
                                  View <span className="h-o-p">Match</span>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
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
