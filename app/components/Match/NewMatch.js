import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createMatch} from '../../actions/match';
import game_user_ids from '../../../config/game_user_ids';
import game_settings from '../Modules/game_settings.json';
import {Link} from 'react-router';
// import moment from 'moment';
class newMatch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      ladder: '',
      creating: false,
      games: [],
      game_settings: {
        match_available: 'All Regions'
      },
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
    let a = event.target.value;
    if (event.target.name == 'match_fee') {
      if (
        this.state.match_type == 'credits' ||
        this.state.match_type == 'credit'
      ) {
        if (this.state.match_fee) {
          a = '' + parseInt(a);
        }
      }
    }
    const obj = {[event.target.name]: a};
    if (
      event.target.name == 'match_type' &&
      a == 'credits' &&
      this.state.match_fee
    ) {
      obj.match_fee = parseInt(this.state.match_fee);
    }
    this.setState(obj);
  }

  handleSettingsChange(event) {
    const game_settings = this.state.game_settings;
    game_settings[event.target.name] = event.target.value;
    this.setState({
      game_settings: game_settings
    });
  }
  checkIfPendingScore() {
    const team_array = this.getTeamArray();

    fetch(
      '/api/matches/pendingScoreMatches?uid=' +
        this.props.user.id +
        '&teams=' +
        team_array
    )
      .then(res => res.json())
      .then(json => {
        this.checkIfPendingDispute();
        if (json.ok) {
          if (json.any_pending) {
            this.setState({
              has_pending_match: true
            });
          }
        }
      })
      .catch(function() {
        this.checkIfPendingDispute();
      });
  }
  getTeamArray() {
    let team_array = [];
    // console.log(this.state.eligible_teams);
    for (let i = 0; i < this.state.eligible_teams.length; i++) {
      const team_parent = this.state.eligible_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : team_parent;
      if (team.id && team.team_type == 'matchfinder') {
        team_array.push(team.id);
      }
    }
    // console.log(team_array);
    team_array = team_array.join(',');
    return team_array;
  }

  checkIfPendingDispute() {
    const team_array = this.getTeamArray();
    fetch(
      '/api/matches/pendingDisputesCount?uid=' +
        this.props.user.id +
        '&teams=' +
        team_array
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          if (json.disputed_count >= 3) {
            this.setState({
              has_pending_disputes: true
            });
          }
        }
      });
  }

  loadTeams() {
    fetch(
      '/api/teams/team_of_user/?filter_actives=yes&uid=' + this.props.user.id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const obj = {
            eligible_teams: json.teams ? json.teams : [],
            eligible_teams_loaded: true
          };
          this.setState(obj, this.checkIfPendingScore);
        }
      });
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
              // this.checkIfPendingScore();
              this.loadTeams();
            }
          );
        }
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
  }

  handleCreation(event) {
    event.preventDefault();
    if (this.state.creating) {
      return false;
    }
    this.setState({
      creating: true
    });
    this.props.dispatch(
      createMatch(
        {
          team_1_id: this.props.params.id,
          game_id: this.state.game_info.id,
          game_title: this.state.game_info.title,
          ladder_id: this.state.team_info.ladder_id,
          // starts_at:
          // '' + this.state.starts_at + ' ' + this.state.starts_at_time,
          match_starts_in: this.state.match_starts_in,
          match_type: this.state.match_type,
          match_players: this.state.match_players,
          match_fee:
            this.state.match_type == 'credits' ||
            this.state.match_type == 'cash'
              ? this.state.match_fee
              : '',
          using_users: this.state.using_users,
          game_settings: this.state.game_settings
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
      (this.state.match_type == 'credits' || this.state.match_type == 'cash') &&
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
            if (this.state.match_type == 'credits') {
              if (
                parseFloat(
                  this.state.team_info.team_users[i].user_info.credit_balance
                ) < amount
              ) {
                // return false;
              } else {
                user_done++;
              }
            } else if (this.state.match_type == 'cash') {
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
    if (
      this.state.match_type == 'cash' &&
      parseFloat(team_u.user_info.cash_balance) < amount
    ) {
      return false;
    }
    if (
      this.state.match_type == 'credits' &&
      parseFloat(team_u.user_info.credit_balance) < amount
    ) {
      return false;
    }
    return true;
  }

  amIEligible(team_u) {
    const gamer_tag = this.state.team_info.ladder.gamer_tag;
    if (!team_u.user_info['gamer_tag_' + gamer_tag]) {
      return (
        <span
          className="text-danger"
          data-toggle="tooltip"
          title="GamerTag does not exist"
        >
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

    if (
      this.state.match_type == 'cash' &&
      parseFloat(team_u.user_info.cash_balance) < amount
    ) {
      return (
        <span
          className="text-danger"
          data-toggle="tooltip"
          title="Not Enough OCG Cash Balance"
        >
          <img className="icon_size" src="/images/controller-red.svg" /> Not
          Eligible
        </span>
      );
    }
    if (
      this.state.match_type == 'credits' &&
      parseFloat(team_u.user_info.credit_balance) < amount
    ) {
      return (
        <span
          className="text-danger"
          data-toggle="tooltip"
          title="Not Enough Credit Balance"
        >
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

  renderGameSettings() {
    if (!this.state.game_info) {
      return false;
    }
    let ttl = this.state.game_info.title;
    ttl = ttl.toLowerCase();
    ttl = ttl.replace(new RegExp(' ', 'g'), '');
    ttl = ttl.replace(new RegExp(':', 'g'), '');
    ttl = ttl.replace(new RegExp('-', 'g'), '');
    ttl = ttl.replace(new RegExp('_', 'g'), '');
    if (!game_settings[ttl]) {
      return false;
    }
    const settings = game_settings[ttl];
    return (
      <div>
        {settings.map((setting, i) => {
          if (setting.type != 'select') {
            return false;
          }
          // console.log('is a setting');
          const id = setting.label
            .replace(new RegExp(' ', 'g'), '_')
            .toLowerCase();
          return (
            <div className="form-group col-md-12" key={setting.label}>
              <label htmlFor={id}>{setting.label}</label>
              <select
                id={id}
                className="form-control"
                onChange={this.handleSettingsChange.bind(this)}
                required
                value={this.state.game_settings[id]}
                name={id}
              >
                <option value="">Select</option>
                {setting.options.map((opt, i) => {
                  return (
                    <option value={opt} key={opt}>
                      {opt}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    );
  }

  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    'Username',
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
      <section className="middle_part_login mt-4">
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
                  ) : this.state.team_info.match_type == 'tournaments' ? (
                    <div className="alert alert-warning">
                      Team is only for tournaments.
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
                        <div className="uid_det">
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
<br />
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
                            <option value="61|minutes">Available Now</option>
                            <option value="10|minutes">In 10 minutes</option>
                            <option value="15|minutes">In 15 minutes</option>
                            <option value="30|minutes">In 30 minutes</option>
                            <option value="45|minutes">In 45 minutes</option>
                            <option value="60|minutes">In 1 hour</option>
                            <option value="120|minutes">In 2 hours</option>
                            <option value="5|hours">In 5 hours</option>

                            {/*  <option value="10|hours">In 10 hours</option>
                              <option value="1|day">In 1 day</option>
                              <option value="2|days">In 2 days</option>
                              <option value="3|days">In 3 days</option>
                              <option value="7|days">In 1 week</option><input
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
                        {this.state.match_starts_in == '61|minutes' ? (
                          <div
                            className="alert alert-info"
                            style={{
                              padding: '0px 14px',
                              fontSize: 13
                            }}
                          >
                            This match will remain active for 1 hour or until
                            the match gets acceepted. Once your match is
                            accepted, it will be scheduled for nearest 10 minute
                            mark.
                          </div>
                        ) : (
                          ''
                        )}
                      </div>

                      <div className="form-group col-md-12 region_input">
                        <label htmlFor="title">Match Region</label>
                        {/*}  <select
                          required
                          onChange={this.handleSettingsChange.bind(this)}
                          className="form-control"
                          name="match_available"
                          id="match_available"
                        >
                          <option value="">Select</option>
                          <option value={this.props.user.country}>
                            {this.props.user.country}
                          </option>
                          <option value="All Regions">All Regions</option>
                        </select>*/}
                        <label>
                          <input
                            type="radio"
                            name="match_available"
                            value={'North America'}
                            checked={
                              this.state.game_settings['match_available'] ===
                              'North America'
                            }
                            onChange={this.handleSettingsChange.bind(this)}
                          />{' '}
                          North America{' '}
                          <img
                            src={'/images/icons/flag_us.png'}
                            className="flag_ico"
                          />{' '}
                          <img
                            src={'/images/icons/flag_canada.png'}
                            className="flag_ico"
                          />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="match_available"
                            value={'Europe'}
                            checked={
                              this.state.game_settings['match_available'] ===
                              'Europe'
                            }
                            onChange={this.handleSettingsChange.bind(this)}
                          />{' '}
                          Europe{' '}
                          <img
                            src={'/images/icons/flag_eu.png'}
                            className="flag_ico"
                          />
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="match_available"
                            value={'All Regions'}
                            checked={
                              this.state.game_settings['match_available'] ===
                              'All Regions'
                            }
                            onChange={this.handleSettingsChange.bind(this)}
                          />{' '}
                          All Regions <span className="fa fa-globe"> </span>
                        </label>
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
                          <option value="credits">Paid using Credits</option>
                          <option value="cash">Paid using OCG Cash</option>
                        </select>
                      </div>

                      {this.state.match_type == 'credits' ||
                      this.state.match_type == 'cash' ? (
                        <div className="form-group col-md-12">
                          <label htmlFor="match_fee">Match Entry Fee</label>
                          <input
                            type="number"
                            min="1"
                            step={
                              this.state.match_type == 'cash' ? '0.01':'1'
                            }
                            id="match_fee"
                            className="form-control"
                            onChange={this.handleChange.bind(this)}
                            required
                            placeholder="Match Fees"
                            name="match_fee"
                            value={this.state.match_fee}
                          />
                          {(this.state.match_type == 'credits' ||
                            this.state.match_type == 'cash') &&
                          this.state.match_fee &&
                          this.state.match_fee < 1 ? (
                            <div className="text-danger">
                              Match fee can not be less than{' '}
                              {this.state.match_type == 'credits'
                                ? ' 1 credits'
                                : ' $1.00'}
                            </div>
                          ) : (
                            false
                          )}
                        </div>
                      ) : (
                        false
                      )}

                      {this.renderGameSettings()}
                      <div className="form-group col-md-12 text-center">
                        <button
                          disabled={
                            !this.isEligible() ||
                            this.state.creating ||
                            this.state.has_pending_match ||
                            this.state.has_pending_disputes
                          }
                          className="btn btn-default bttn_submit"
                          type="submit"
                        >
                          {this.state.creating
                            ? 'please wait...'
                            : 'Create Match'}
                        </button>
                        {this.state.has_pending_match ? (
                          <span className="text-danger">
                            You have a match awaiting score. Please provide
                            score of pending match before creating a new match.
                          </span>
                        ) : (
                          false
                        )}
                        {this.state.has_pending_disputes ? (
                          <span className="text-danger">
                            You have high number of open disputes. You can only
                            create a new match once your dispute count is less
                            than 3
                          </span>
                        ) : (
                          false
                        )}
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
                                  <th className="d-none t-md-table-cell">
                                    Role
                                  </th>
                                  <th
                                    className={
                                      'act_pr' +
                                      this.state.team_info.ladder.gamer_tag
                                    }
                                  >
                                    <span
                                      className={
                                        game_user_ids.tag_icons[
                                          this.state.team_info.ladder.gamer_tag
                                        ]
                                      }
                                    />
                                    <span class="d-none d-md-inline-block">{
                                      this.tag_names[
                                        this.state.team_info.ladder.gamer_tag
                                      ]
                                    }</span>
                                  </th>
                                  <th>Eligibility</th>
                                  <th><span class="d-none d-md-inline-block">Include</span></th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.team_info.team_users.map(
                                  (team_user, i) => {
                                    if (team_user.removed == 1) {
                                      return false;
                                    }
                                    if (team_user.accepted == false) {
                                      return false;
                                    }
                                    return (
                                      <tr key={team_user.id}>
                                        <td className={
                                          team_user.user_info.prime
                                            ? ' is_prime_cell is_prime_type_' +
                                              team_user.user_info.prime_type
                                            : ' is_not_prime '
                                        }>

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

                                        <td className="d-none t-md-table-cell">
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
export default connect(mapStateToProps)(newMatch);
