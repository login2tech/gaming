import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createMatch} from '../../actions/match';
import game_user_ids from '../../../config/game_user_ids';

import {Link} from 'react-router';
// import moment from 'moment';
class NewTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      ladder: '',
      games: [],
      match_players: '',
      team_info: {ladder: {title: ''}, team_users: [], title: ''},
      game_info: {title: ''},
      starts_at: new Date(new Date().getTime() + 10 * 60 * 1000),
      starts_at_time: new Date(new Date().getTime() + 10 * 60 * 1000),
      match_type: '',
      using_users: [],
      match_fee: 0,
      match_starts_in: ''
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  fetchGame() {
    fetch('/api/games/single/' + this.state.team_info.ladder.game_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              game_info: json.item
            },
            () => {
              // this.fetchGame();
              // this.fetchTeam();
            }
          );
        }
      });
  }
  newDate(a, b, c) {
    this.setState({
      starts_at: b
    });
  }
  newDateTime(a, b, c) {
    this.setState({
      starts_at_time: b
    });
  }
  componentDidMount() {
    fetch('/api/teams/single/' + this.props.params.id)
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
    setTimeout(() => {
      // $('#starts_at').flatpickr({
      //   enableTime: false,
      //   dateFormat: 'Y-m-d',
      //   // stepMinute: 10, //intervals of minutes
      //   minDate: this.state.starts_at,
      //   defaultDate: this.state.starts_at,
      //   // minDateTime: new Date(new Date().getTime() + 10 * 60 * 1000), //number of minutes
      //   minuteIncrement: 10,
      //   maxDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
      //   onChange: this.newDate.bind(this)
      // });
      // $('#starts_at_time').flatpickr({
      //   enableTime: true,
      //   dateFormat: ' H:i',
      //   noCalendar: true,
      //   stepMinute: 10, //intervals of minutes
      //   // minDate: this.state.starts_at,
      //   // defaultDate: this.state.starts_at,
      //   // minDateTime: new Date(new Date().getTime() + 10 * 60 * 1000), //number of minutes
      //   minuteIncrement: 10,
      //   // maxDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
      //   onChange: this.newDateTime.bind(this)
      // });
    }, 2000);
  }

  handleCreation(event) {
    event.preventDefault();
    // ();
    this.props.dispatch(
      createMatch(
        {
          team_1_id: this.props.params.id,
          game_id: this.state.game_info.id,
          ladder_id: this.state.team_info.ladder_id,
          // starts_at:
          // '' + this.state.starts_at + ' ' + this.state.starts_at_time,
          match_starts_in: this.state.match_starts_in,
          match_type: this.state.match_type,
          match_players: this.state.match_players,
          match_fee:
            this.state.match_type == 'paid' ? this.state.match_fee : '',
          using_users: this.state.using_users
        },
        this.props.user
      )
    );
  }

  isEligible() {
    const gamer_tag = this.state.team_info.ladder.gamer_tag;
    const required_users = this.state.match_players;
    let user_done = 0;
    if (this.state.match_type == '' || this.state.starts_at == '') {
      return false;
    }

    if (
      this.state.match_type == 'paid' &&
      (this.state.match_fee == '' || parseFloat(this.state.match_fee) <= 0)
    ) {
      return false;
    }
    if (parseInt(this.state.match_players) != this.state.using_users.length) {
      return false;
    }

    for (let i = 0; i < this.state.team_info.team_users.length; i++) {
      if (
        this.state.using_users.indexOf(
          this.state.team_info.team_users[i].user_info.id
        ) < -1
      ) {
        // this user is not playing, no need to check it's eligibility;
        continue;
      }
      if (
        this.state.team_info.team_users[i].user_info['gamer_tag_' + gamer_tag]
      ) {
        // step 1 passed, if free no more steps
        if (this.state.match_type == 'free') {
          user_done++;
        } else {
          const amount = parseFloat(this.state.match_fee);
          for (let i = 0; i < this.state.team_info.team_users.length; i++) {
            if (
              parseFloat(
                this.state.team_info.team_users[i].user_info.cash_balance
              ) < amount
            ) {
              // return false;
            } else {
              user_done++;
            }
          }
        }
      }
    }
    if (user_done >= required_users) {
      return true;
    }
    return false;

    // return true;
  }

  amIEligibleFlag(team_u) {
    const gamer_tag = this.state.team_info.ladder.gamer_tag;
    if (!team_u.user_info['gamer_tag_' + gamer_tag]) {
      return false;
    }
    if (this.state.match_type == '') {
      return false;
    }
    const amount = parseFloat(this.state.match_fee);

    if (this.state.match_type == 'free') {
      return true;
    }

    if (parseFloat(team_u.user_info.cash_balance) < amount) {
      return false;
    }
    return true;
  }

  amIEligible(team_u) {
    const gamer_tag = this.state.team_info.ladder.gamer_tag;
    if (!team_u.user_info['gamer_tag_' + gamer_tag]) {
      return (
        <span className="text-danger">
          <img className="icon_size" src="/images/controller-red.svg" /> Not
          Eligible
        </span>
      );
    }
    if (this.state.match_type == '') {
      return '--';
    }

    const amount = parseFloat(this.state.match_fee);
    // console.log(team_u.user_info['gamer_tag_' + gamer_tag]);

    if (this.state.match_type == 'free') {
      return (
        <span className="text-success">
          <img className="icon_size" src="/images/controller-green.svg" />{' '}
          Eligible
        </span>
      );
    }

    if (parseFloat(team_u.user_info.cash_balance) < amount) {
      return (
        <span className="text-danger">
          <img className="icon_size" src="/images/controller-red.svg" /> Not
          Eligible
        </span>
      );
    }
    return (
      <span className="text-success">
        <img className="icon_size" src="/images/controller-green.svg" />{' '}
        Eligible
      </span>
    );
  }
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    'Epic Games Username',
    'Steam Username',
    'Battletag'
  ];
  render() {
    let min = this.state.team_info.ladder.min_players;
    let max = this.state.team_info.ladder.max_players;
    if (max < min) {
      const tmp = max;
      max = min;
      min = tmp;
    }
    const player_selection = [];
    for (let i = min; i <= max; i++) {
      player_selection.push(i);
    }
    // console.log(this.state.team_info.ladder, min, max, player_selection);
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>New Match</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  {this.state.team_info.removed ? (
                    <div className="alert alert-warning">
                      Team has already been deleted
                    </div>
                  ) : (
                    <form
                      onSubmit={this.handleCreation.bind(this)}
                      autoComplete="off"
                    >
                      <div className="form-group col-md-12">
                        <label htmlFor="title">Team</label>
                        <br />
                        <strong>{this.state.team_info.title}</strong>
                      </div>
                      <br />

                      <div className="form-group col-md-12">
                        <label htmlFor="title">Ladder</label>
                        <br />
                        <strong>
                          {this.state.game_info.title +
                            ' - ' +
                            this.state.team_info.ladder.title}
                        </strong>{' '}
                        <span
                          className={
                            game_user_ids.tag_icons[
                              this.state.team_info.ladder.gamer_tag
                            ]
                          }
                        />
                      </div>
                      <br />
                      <div className="form-group col-md-12">
                        <label htmlFor="title">User Id Required</label>
                        <br />
                        <strong>
                          {
                            this.tag_names[
                              this.state.team_info.ladder.gamer_tag
                            ]
                          }
                        </strong>
                      </div>
                      <br />
                      {/*}
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Match Date</label>
                      <div className="input-group date">
                        <input
                          type="text"
                          id="starts_at"
                          className="form-control"
                          required
                          data-toggle="datetimepicker"
                          data-target="#starts_at"
                          placeholder="Match Start Date"
                          name="starts_at"
                          onChange={this.handleChange.bind(this)}
                        />
                        <span className="input-group-addon">
                          <span className="glyphicon glyphicon-date" />
                        </span>
                      </div>
                    </div>*/}

                      <div className="form-group col-md-12">
                        <label htmlFor="title">Match Starts at</label>
                        <div className="input-group date">
                          <select
                            className="form-control"
                            name="match_starts_in"
                            id="match_starts_in"
                            onChange={this.handleChange.bind(this)}
                          >
                            <option value="">{'Select'}</option>
                            <option value="5|minutes">In 5 minutes</option>
                            <option value="10|minutes">In 10 minutes</option>
                            <option value="15|minutes">In 15 minutes</option>
                            <option value="30|minutes">In 30 minutes</option>
                            <option value="45|minutes">In 45 minutes</option>
                            <option value="60|minutes">In 1 hour</option>
                            <option value="120|minutes">In 2 hours</option>
                            <option value="5|hours">In 5 hours</option>
                            <option value="10|hours">In 10 hours</option>
                            <option value="1|day">In 1 day</option>
                            <option value="2|days">In 2 days</option>
                            <option value="3|days">In 3 days</option>
                            <option value="7|days">In 1 week</option>
                            {/*<input
                          type="text"
                          id="starts_at_time"
                          className="form-control"
                          required
                          data-toggle="datetimepicker"
                          data-target="#starts_at_time"
                          placeholder="Match Start Time"
                          name="starts_at"
                          onChange={this.handleChange.bind(this)}
                        />
                        <span className="input-group-addon">
                          <span className="glyphicon glyphicon-time" />
                        </span>*/}
                          </select>
                        </div>
                      </div>

                      <div className="form-group col-md-12">
                        <label htmlFor="title">Match Players</label>
                        <select
                          required
                          onChange={this.handleChange.bind(this)}
                          className="form-control"
                          name="match_players"
                          id="match_players"
                        >
                          <option value="">Select</option>
                          {player_selection.map((k, i) => {
                            return (
                              <option key={k} value={k}>
                                {k}v{k}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="form-group col-md-12">
                        <label htmlFor="title">Match Type</label>
                        <select
                          required
                          onChange={this.handleChange.bind(this)}
                          className="form-control"
                          name="match_type"
                          id="match_type"
                        >
                          <option value="">Select</option>
                          <option value="free">Free</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>

                      {this.state.match_type == 'paid' ? (
                        <div className="form-group col-md-12">
                          <label htmlFor="match_fee">Match Entry Fee</label>
                          <input
                            type="text"
                            id="match_fee"
                            className="form-control"
                            onChange={this.handleChange.bind(this)}
                            required
                            placeholder="Match Fees"
                            name="match_fee"
                          />
                        </div>
                      ) : (
                        false
                      )}
                      <div className="form-group col-md-12 text-center">
                        <button
                          disabled={!this.isEligible()}
                          className="btn btn-default bttn_submit"
                          type="submit"
                        >
                          Create Match
                        </button>
                      </div>
                    </form>
                  )}
                  {this.state.team_info.removed ? (
                    false
                  ) : (
                    <div className="row">
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <div className="content_box">
                          <h5 className="prizes_desclaimer">
                            <i className="fa fa-users" aria-hidden="true" />{' '}
                            SQUAD
                          </h5>
                          <div className="table_wrapper">
                            <table className="table table-striped table-ongray table-hover">
                              <thead>
                                <tr>
                                  <th>Username</th>
                                  <th>Role</th>
                                  <th>
                                    <span
                                      className={
                                        game_user_ids.tag_icons[
                                          this.state.team_info.ladder.gamer_tag
                                        ]
                                      }
                                    />
                                    {
                                      this.tag_names[
                                        this.state.team_info.ladder.gamer_tag
                                      ]
                                    }
                                  </th>
                                  <th>Eligibility</th>
                                  <th>Include</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.team_info.team_users.map(
                                  (team_user, i) => {
                                    if (team_user.removed == 1) {
                                      return false;
                                    }
                                    if (team_user.acceepted == false) {
                                      return false;
                                    }
                                    return (
                                      <tr key={team_user.id}>
                                        <td>
                                          <Link
                                            to={
                                              team_user.user_info
                                                ? '/u/' +
                                                  team_user.user_info.username
                                                : ''
                                            }
                                          >
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
                                          {team_user.user_info[
                                            'gamer_tag_' +
                                              this.state.team_info.ladder
                                                .gamer_tag
                                          ] ? (
                                            team_user.user_info[
                                              'gamer_tag_' +
                                                this.state.team_info.ladder
                                                  .gamer_tag
                                            ]
                                          ) : (
                                            <span className="text-danger">
                                              No user Id
                                            </span>
                                          )}
                                        </td>
                                        <td>{this.amIEligible(team_user)}</td>
                                        <td>
                                          <label>
                                            <input
                                              disabled={
                                                !this.amIEligibleFlag(team_user)
                                              }
                                              type="checkbox"
                                              checked={
                                                this.state.using_users.indexOf(
                                                  team_user.user_info.id
                                                ) > -1
                                              }
                                              onChange={() => {
                                                const using_users = this.state
                                                  .using_users;
                                                if (
                                                  using_users.indexOf(
                                                    team_user.user_info.id
                                                  ) > -1
                                                ) {
                                                  using_users.splice(
                                                    using_users.indexOf(
                                                      team_user.user_info.id
                                                    ),
                                                    1
                                                  );
                                                } else {
                                                  using_users.push(
                                                    team_user.user_info.id
                                                  );
                                                }
                                                this.setState({
                                                  using_users: using_users
                                                });
                                              }}
                                            />
                                          </label>
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
                  )}
                </div>
              </div>
            </div>
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
// export default SingleThread;
export default connect(mapStateToProps)(NewTeam);
