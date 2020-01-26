import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
// const moment = require('moment');
import {join_match, saveScores, leave_match} from '../../actions/match8';
import game_user_ids from '../../../config/game_user_ids';

import Messages from '../Modules/Messages';

class Money8Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      is_loaded: false,

      match: {
        team_1: '',
        team_2: '',
        game: {},
        ladder: {},
        players: '[]'
      },
      ladder: '',
      games: [],
      my_score: '',
      their_score: '',
      approve_join: false
    };
  }

  dynamicStatus() {
    if (!this.state.match.team_1) {
      return 'Pending';
    }
    if (this.state.match.status == 'disputed') {
      return 'Disputed';
    }
    if (this.state.match.status == 'complete') {
      return 'Complete';
    }
    if (!this.state.match.team_1_result && !this.state.match.team_2_result) {
      return 'Pending Results';
    }
    if (!this.state.match.team_1_result || !this.state.match.team_2_result) {
      return 'Pending Results Confirmation';
    }
    if (this.state.match.team_1_result != this.state.match.team_2_result) {
      return 'Disputed';
    }

    let result;

    if (this.state.match.result == 'tie') {
      result = 'Tie';
    } else {
      if (this.state.match.result == 'team_1') {
        result = 'Mix Wins';
      } else {
        result = 'Match Wins';
      }
    }

    return 'Complete - ' + result;
  }

  showGamerTag() {
    return game_user_ids.tag_names[this.state.match.ladder.gamer_tag];
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  fetchMatch() {
    fetch('/api/money8/single/' + this.props.params.match_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              match: json.item
            },
            () => {
              // this.fetchTeams();
            }
          );
        }
      });
  }

  componentDidMount() {
    this.fetchMatch();
  }

  saveScore() {
    const team_1 = this.state.match.team_1.split('|');
    const team_2 = this.state.match.team_2.split('|');

    const val = {};
    // const me = this.props.user.id;

    if (
      team_1.indexOf('' + this.props.user.id) > -1 &&
      !this.state.match.team_1_result
    ) {
      val.team_1_result =
        '' + this.state.my_score + '-' + this.state.their_score;
    }

    if (
      team_2.indexOf('' + this.props.user.id) > -1 &&
      !this.state.match.team_2_result
    ) {
      val.team_2_result =
        '' + this.state.my_score + '-' + this.state.their_score;
    }
    val.id = this.state.match.id;
    this.props.dispatch(saveScores(val, this.props.user));
  }

  agreeToTermsForMatchJoin(event) {
    event.preventDefault();

    this.props.dispatch(
      join_match(
        {
          match_id: this.state.match.id
        },
        this.props.user
      )
    );
  }

  joinPool() {
    this.setState({
      approve_join: true
    });
  }

  leavePool(e) {
    this.props.dispatch(
      leave_match(
        {
          match_id: this.state.match.id
        },
        this.props.user
      )
    );
  }

  renderLeave() {
    if (!this.props.user) {
      return;
    }
    if (this.state.match.players_joined >= this.state.match.players_total) {
      return false;
    }
    let i_am_in_pool = false;

    const me = this.props.user.id;
    // console.log(this.state.match.players);
    const users = JSON.parse(this.state.match.players);
    // console.log(users);

    for (let i = 0; i < users.length; i++) {
      // console.log(users[i] , me)
      if (users[i] == me) {
        i_am_in_pool = true;
        break;
      }
    }

    if (!i_am_in_pool) {
      return false;
    }

    if (this.state.confirmLeave) {
      return (
        <div className="btn-group">
          <button
            type="button"
            onClick={e => {
              this.leavePool(e);
            }}
            className="btn btn-default bttn_submit mw_200"
          >
            Are you Sure?
          </button>

          <button
            type="button"
            onClick={() => {
              this.setState({
                confirmLeave: false
              });
            }}
            className="btn btn-danger bttn_submit mw_200"
          >
            X
          </button>
        </div>
      );
    }

    return (
      <div>
        <button
          type="button"
          // disabled={disabled}
          onClick={() => {
            this.setState({confirmLeave: true});
          }}
          className="btn btn-danger bttn_submit mw_200"
        >
          Leave Pool
        </button>
      </div>
    );
  }

  renderJoin() {
    if (!this.props.user) {
      return false;
    }
    if (!this.state.match.id) {
      return false;
    }
    if (this.state.match.players_joined >= this.state.match.players_total) {
      return false;
    }

    // return false;
    const me = this.props.user.id;
    // console.log(this.state.match);
    const users = JSON.parse(this.state.match.players);

    for (let i = 0; i < users.length; i++) {
      // console.log(users[i] , me)
      if (users[i] == me) {
        return false;
      }
    }
    let current_user_bal;
    let disabled = false;
    // debugger;
    let disabled_reason = '';
    if (this.state.match.match_type != 'free') {
      if (this.state.match.match_type == 'cash') {
        current_user_bal = this.props.user.cash_balance;
      } else if (this.state.match.match_type == 'credits') {
        current_user_bal = this.props.user.credit_balance;
      }
      if (!current_user_bal) {
        current_user_bal = 0;
      }

      if (current_user_bal < this.state.match.match_fee) {
        disabled = true;
        disabled_reason =
          'you do not have enough ' +
          (this.state.match.match_type == 'cash' ? '$' : 'credits') +
          ' to join this pool';
      }
    }

    if (this.state.match.ladder && this.state.match.ladder.gamer_tag) {
      if (!this.props.user['gamer_tag_' + this.state.match.ladder.gamer_tag]) {
        disabled = true;
        disabled_reason =
          'You do not have the required user id set to join this pool.';
      }
    }

    if (disabled && this.state.approve_join) {
      return false;
    }

    if (this.state.approve_join) {
      return (
        <div className="btn-group">
          <button
            type="button"
            onClick={e => {
              this.agreeToTermsForMatchJoin(e);
            }}
            className="btn btn-default bttn_submit mw_200"
          >
            Are you Sure?
          </button>

          <button
            type="button"
            onClick={() => {
              this.setState({
                approve_join: false
              });
            }}
            className="btn btn-danger bttn_submit mw_200"
          >
            X
          </button>
        </div>
      );
    }

    return (
      <div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            this.joinPool();
          }}
          className="btn btn-default bttn_submit mw_200"
        >
          Join this mix-and-match Pool
        </button>

        <small className="text-danger">{disabled_reason}</small>
      </div>
    );
  }

  renderScoreSubmit() {
    if (!this.state.is_loaded) {
      return false;
    }
    if (
      this.state.match.status == 'disputed' ||
      this.state.match.status == 'complete'
    ) {
      return false;
    }
    const team_1 = this.state.match.team_1.split('|');
    const team_2 = this.state.match.team_2.split('|');

    if (
      // team_1.indexOf(''+this.props.user.id) > -1 &&
      this.state.match.team_1_result &&
      this.state.match.team_2_result
    ) {
      return (
        <div>
          <p className="alert alert-success">
            Score submitted by Mix = {this.state.match.team_1_result}
          </p>
          <p className="alert alert-success">
            Score submitted by Match = {this.state.match.team_2_result}
          </p>
        </div>
      );
    }

    if (
      team_1.indexOf('' + this.props.user.id) > -1 &&
      this.state.match.team_1_result
    ) {
      return (
        <div>
          <p className="text-success">
            Score submitted by Mix = {this.state.match.team_1_result}
          </p>
        </div>
      );
    }

    if (
      team_2.indexOf('' + this.props.user.id) > -1 &&
      this.state.match.team_2_result
    ) {
      return (
        <div>
          <p className="text-success">
            Score submitted by Match = {this.state.match.team_2_result}
          </p>
        </div>
      );
    }

    return (
      <div>
        <h5 className="prizes_desclaimer">Report Scrore</h5>
        <div className="well well-sm well-dark margin-20">
          <form
            className="light-form"
            onSubmit={event => {
              event.preventDefault();
              this.saveScore();
            }}
          >
            <Messages messages={this.props.messages} />
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="my_score">My Team Score</label>
                  <p>How many rounds did your team win?</p>
                  <input
                    className="form-control "
                    type="text"
                    name="my_score"
                    id="my_score"
                    value={this.state.my_score}
                    required
                    placeholder="Your Team Score"
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="their_score">Opponent Team Score</label>
                  <p>How many rounds did the oppenent team win?</p>
                  <input
                    className="form-control "
                    type="text"
                    name="their_score"
                    id="their_score"
                    value={this.state.their_score}
                    required
                    placeholder="Opponent Team Score"
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <button
                  type="submit"
                  className="btn  btn-primary margin-5 max-width-300"
                  disabled={
                    this.state.my_score == '' || this.state.their_score == ''
                  }
                >
                  Report Match Score
                </button>
              </div>
            </div>
          </form>
        </div>
        <br />
        <br />
      </div>
    );
  }

  renderStartedMatch() {
    const team_1 = this.state.match.team_1.split('|');
    const team_2 = this.state.match.team_2.split('|');
    return (
      <div className="content_box">
        {this.renderScoreSubmit()}

        <h5 className="prizes_desclaimer">
          <i className="fa fa-users" aria-hidden="true" /> Mix{' '}
          {this.state.match.status == 'complete' &&
          this.state.match.result == 'team_1' ? (
            <span>
              {' '}
              - <span className="text text-success">W</span>
            </span>
          ) : (
            false
          )}
          {(this.state.match.status == 'complete' ||
            this.state.match.status == 'Complete') &&
          this.state.match.result == 'team_2' ? (
            <span>
              {' '}
              - <span className="text text-danger">L</span>
            </span>
          ) : (
            false
          )}
        </h5>

        <div className="table_wrapper">
          <table className="table table-striped table-ongray table-hover">
            <thead>
              <tr>
                <th style={{width: '50%'}}>Username</th>
                <th className={'act_pr' + this.state.match.ladder.gamer_tag}>
                  {this.showGamerTag()}
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.match.players_obj &&
                this.state.match.players_obj.map((team_user, i) => {
                  if (team_1.indexOf('' + team_user.id) > -1) {
                    return (
                      <tr key={team_user.id}>
                        <td>
                          {team_user.prime && (
                            <img
                              src={
                                '/assets/icons/ocg_member_' +
                                team_user.prime_type +
                                '.png'
                              }
                              className="inline-star float-right"
                            />
                          )}
                          <Link target="_blank" to={'/u/' + team_user.username}>
                            {team_user.username}
                          </Link>
                        </td>
                        <td>
                          {team_user[
                            'gamer_tag_' + this.state.match.ladder.gamer_tag
                          ] ? (
                            team_user[
                              'gamer_tag_' + this.state.match.ladder.gamer_tag
                            ]
                          ) : (
                            <span className="text-danger">No User id</span>
                          )}
                        </td>
                      </tr>
                    );
                  } else {
                    return false;
                  }
                })}
            </tbody>
          </table>
        </div>

        <br />

        <h5 className="prizes_desclaimer">
          <i className="fa fa-users" aria-hidden="true" /> Match{' '}
          {this.state.match.status == 'complete' &&
          this.state.match.result == 'team_1' ? (
            <span>
              {' '}
              - <span className="text text-danger">L</span>
            </span>
          ) : (
            false
          )}
          {(this.state.match.status == 'complete' ||
            this.state.match.status == 'Complete') &&
          this.state.match.result == 'team_2' ? (
            <span>
              {' '}
              - <span className="text text-success">W</span>
            </span>
          ) : (
            false
          )}
        </h5>

        <div className="table_wrapper">
          <table className="table table-striped table-ongray table-hover">
            <thead>
              <tr>
                <th style={{width: '50%'}}>Username</th>
                <th className={'act_pr' + this.state.match.ladder.gamer_tag}>
                  {this.showGamerTag()}
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.match.players_obj &&
                this.state.match.players_obj.map((team_user, i) => {
                  if (team_2.indexOf('' + team_user.id) > -1) {
                    return (
                      <tr key={team_user.id}>
                        <td>
                          {team_user.prime && (
                            <img
                              src={
                                '/assets/icons/ocg_member_' +
                                team_user.prime_type +
                                '.png'
                              }
                              className="inline-star float-right"
                            />
                          )}
                          <Link target="_blank" to={'/u/' + team_user.username}>
                            {team_user.username}
                          </Link>
                        </td>
                        <td>
                          {team_user[
                            'gamer_tag_' + this.state.match.ladder.gamer_tag
                          ] ? (
                            team_user[
                              'gamer_tag_' + this.state.match.ladder.gamer_tag
                            ]
                          ) : (
                            <span className="text-danger">No user id</span>
                          )}
                        </td>
                      </tr>
                    );
                  } else {
                    return false;
                  }
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const divStyle =
      this.state.match &&
      this.state.match.game &&
      this.state.match.game.banner_url
        ? {
            backgroundImage: 'url(' + this.state.match.game.banner_url + ')'
          }
        : {};
    let game_settings =
      this.state.match && this.state.match.game_settings
        ? JSON.parse(this.state.match.game_settings)
        : {};
    if (!game_settings) {
      game_settings = {};
    }
    const game_settings_keys = Object.keys(game_settings);
    return (
      <div>
        <section className="page_title_bar" style={divStyle}>
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <div className="row bbt">
                    <div className="col-2 col-md-1">
                      <span
                        className={
                          game_user_ids.tag_icons[
                            this.state.match.ladder.gamer_tag
                          ] + ' pf_icon_big '
                        }
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="match_heading">
                        <h4>Mix & Match</h4>
                      </div>
                      <div className="twovstwo">
                        {this.state.match.players_total / 2} VS{' '}
                        {this.state.match.players_total / 2} MATCH
                      </div>
                    </div>

                    <div className="col-10 col-md-6 pt-3">
                      <span className="game_station">
                        {this.state.match.game.title} @{' '}
                        {this.state.match.ladder.title}
                      </span>
                      <div className="match_start_date">
                        {/* {moment().isAfter(moment(this.state.match.starts_at))
                      ? 'Match Started:'
                      : 'Match Starts'}{' '}
                    {moment(this.state.match.starts_at).format('lll')} ({' '}
                    {moment(this.state.match.starts_at).fromNow()} ) */}
                        <strong>
                          {this.state.match.players_joined}/
                          {this.state.match.players_total}
                        </strong>{' '}
                        joined the mix-and-match pool
                      </div>
                    </div>
                  </div>

                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MATCH ID</span>
                        <p>#{this.state.match.id}</p>
                      </div>

                      <div className="col-md-4">
                        <span> STATUS</span>
                        <p>{this.dynamicStatus(this.state.match.status)}</p>
                      </div>

                      <div className="col-md-4">
                        <span>TYPE</span>
                        <p>
                          {this.state.match.match_type == 'free' ? (
                            'FREE'
                          ) : (
                            <span>
                              {'PAID (' +
                                (this.state.match.match_type == 'cash'
                                  ? '' +
                                    this.state.match.match_fee +
                                    ' OCG Cash'
                                  : '' +
                                    this.state.match.match_fee +
                                    ' credits') +
                                ')'}
                            </span>
                          )}
                        </p>
                      </div>
                      {game_settings_keys.map((k, i) => {
                        const m = k.replace(new RegExp('_', 'g'), ' ');
                        return (
                          <div className="col-md-4 col-6 textcap" key={k}>
                            <span>{m}</span>
                            <p>{game_settings[k]}</p>
                          </div>
                        );
                      })}
                    </div>
                    {this.renderJoin()}
                    {this.renderLeave()}
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
                {/*
                  this.state.match.players_joined <
                this.state.match.players_total ? (
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-users" aria-hidden="true" /> PLAYERS
                    </h5>
                    <br />


                    <div className="table_wrapper"><table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>{this.showGamerTag()}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.match.players_obj &&
                          this.state.match.players_obj.map((team_user, i) => {
                            return (
                              <tr key={team_user.id}>
                                <td>
                                  <Link
                                    target="_blank"
                                    to={'/u/' + team_user.username}
                                  >
                                    {team_user.username}
                                  </Link>
                                </td>
                                <td>
                                  {team_user[
                                    'gamer_tag_' +
                                      this.state.match.ladder.gamer_tag
                                  ] ? (
                                    team_user[
                                      'gamer_tag_' +
                                        this.state.match.ladder.gamer_tag
                                    ]
                                  ) : (
                                    <span className="text-danger">
                                      No user id
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    </div>
                  </div>
                ) : (
                  this.renderStartedMatch()
                )*/}
                {this.state.match.players_joined <
                this.state.match.players_total
                  ? false
                  : this.renderStartedMatch()}

                <br />
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
export default connect(mapStateToProps)(Money8Info);
