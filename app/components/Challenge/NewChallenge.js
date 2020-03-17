import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createMatch} from '../../actions/match';
import game_user_ids from '../../../config/game_user_ids';
import game_settings from '../Modules/game_settings.json';
import cookie from 'react-cookie';

import {Link} from 'react-router';
// import moment from 'moment';
class NewMatchTeamSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenging: cookie.load('challenging_team'),
      title: '',
      ladder: '',
      creating: false,
      games: [],
      game_settings: {
        match_available: 'All Regions'
      },
      ladder_obj: {
        title: ''
      },
      match_players: this.props.params.ctype == 'u' ? '1' : '',
      selected_team_data: {
        team_info: {ladder: {title: ''}, team_users: [], title: ''}
      },
      eligible_teams: [],
      selected_team: {
        ladder: {title: ''},
        team_users: [],
        title: ''
      },

      game_info: {title: ''},
      starts_at: new Date(new Date().getTime() + 10 * 60 * 1000),
      starts_at_time: new Date(new Date().getTime() + 10 * 60 * 1000),
      match_type: '',
      using_users: [],
      match_fee: 0,
      match_starts_in: '24|hours'
    };
  }

  handleChange(event) {
    let vl = event.target.value;
    if (event.target.name == 'ladder') {
      vl = parseInt(vl);
    }
    this.setState({[event.target.name]: vl}, () => {
      this.setLadderObj();
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

  getTeamArray() {
    let team_array = [];
    for (let i = 0; i < this.state.eligible_teams.length; i++) {
      const team_parent = this.state.eligible_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : {};
      if (team.id && team.team_type == 'matchfinder') {
        team_array.push(team.id);
      }
    }
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
      .catch(function(err) {
        this.checkIfPendingDispute();
      });
  }

  setLadderObj() {
    const {games} = this.state;
    for (let i = 0; i < games.length; i++) {
      const tmp_game = games[i];
      for (let j = 0; j < tmp_game.ladders.length; j++) {
        if (tmp_game.ladders[j].id == this.state.ladder) {
          this.setState({
            ladder_obj: tmp_game.ladders[j]
          });
        }
      }
    }
  }

  showGamerTag() {
    const {games} = this.state;
    for (let i = 0; i < games.length; i++) {
      const tmp_game = games[i];
      for (let j = 0; j < tmp_game.ladders.length; j++) {
        if (tmp_game.ladders[j].id == this.state.ladder) {
          const tg = game_user_ids.tag_names[tmp_game.ladders[j].gamer_tag];
          return (
            <>
              <span
                className={
                  game_user_ids.tag_icons[tmp_game.ladders[j].gamer_tag]
                }
              />
              {tg == 'Activision ID' ? 'ID' : tg}
              <br />
              <br />
            </>
          );
          // break;
        }
      }
    }
    return '-';
  }

  fetchGame() {
    fetch('/api/games/list')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              games: json.items
            },
            () => {
              this.loadTeams();
            }
          );
        }
      });
  }

  componentDidMount() {
    this.fetchGame();
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
          is_challenge: true,
          team_1_id: this.state.selected_team.id,
          challenge_for_team_id:  this.props.params.team_id,
          challenge_type : this.props.params.ctype,
          game_id: this.state.ladder_obj.game_id,
          ladder_id: this.state.ladder_obj.id,
          match_starts_in: this.state.match_starts_in,
          match_type: this.state.match_type,
          match_players: this.state.match_players,
          match_fee:
            this.state.match_type == 'credits' ||
            this.state.match_type == 'cash'
              ? this.state.match_fee
              : '',
          game_settings: this.state.game_settings,
          using_users: this.state.using_users
        },
        this.props.user
      )
    );
  }

  isEligible() {
    if (!this.state.selected_team || !this.state.selected_team.id) {
      return false;
    }
    const gamer_tag = this.state.ladder_obj.gamer_tag;
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

    for (let i = 0; i < this.state.selected_team.team_users.length; i++) {
      if (
        this.state.using_users.indexOf(
          this.state.selected_team.team_users[i].user_info.id
        ) < -1
      ) {
        // this user is not playing, no need to check it's eligibility;
        continue;
      }
      if (
        this.state.selected_team.team_users[i].user_info[
          'gamer_tag_' + gamer_tag
        ]
      ) {
        // step 1 passed, if free no more steps
        if (this.state.match_type == 'free') {
          user_done++;
        } else {
          const amount = parseFloat(this.state.match_fee);
          for (let i = 0; i < this.state.selected_team.team_users.length; i++) {
            if (this.state.match_type == 'credits') {
              if (
                parseFloat(
                  this.state.selected_team.team_users[i].user_info
                    .credit_balance
                ) < amount
              ) {
                // return false;
              } else {
                user_done++;
              }
            } else if (this.state.match_type == 'cash') {
              if (
                parseFloat(
                  this.state.selected_team.team_users[i].user_info.cash_balance
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
    const gamer_tag = this.state.ladder_obj.gamer_tag;
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
  handleSettingsChange(event) {
    console.log(event, event.target);
    const game_settings = this.state.game_settings;
    game_settings[event.target.name] = event.target.value;
    this.setState({
      game_settings: game_settings
    });
  }

  renderGameSettings() {
    if (!this.state.ladder_obj || !this.state.ladder_obj.id) {
      return false;
    }
    // console.log(this.state.ladder_obj);
    const game_id = this.state.ladder_obj.game_id;
    // console.log(game_id, this.state.games);
    let ttl = '';
    for (let i = 0; i < this.state.games.length; i++) {
      if (this.state.games[i].id == game_id) {
        ttl = this.state.games[i].title;
        break;
      }
    }
    // console.log(ttl);
    if (!ttl) {
      return false;
    }
    // ttl = this.state.game_info.title;
    ttl = ttl.toLowerCase();
    ttl = ttl.replace(new RegExp(' ', 'g'), '');
    ttl = ttl.replace(new RegExp('-', 'g'), '');
    ttl = ttl.replace(new RegExp('_', 'g'), '');
    ttl = ttl.replace(new RegExp(':', 'g'), '');
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
                value={this.state.game_settings[id]}
                onChange={this.handleSettingsChange.bind(this)}
                required
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

  amIEligible(team_u) {
    const gamer_tag = this.state.ladder_obj.gamer_tag;
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
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    'Username', // epic games
    'Steam Username',
    'Battletag'
  ];
  render() {
    // console.log(this.state.ladder_obj);
    let min = this.state.ladder_obj.min_players;
    let max = this.state.ladder_obj.max_players;
    if (max < min) {
      const tmp = max;
      max = min;
      min = tmp;
    }
    // console.log(min, max);
    const player_selection = [];
    for (let i = min; i <= max; i++) {
      player_selection.push(i);
    }
    // console.log(this.state.selected_team);
    // console.log(this.state.selected_team.ladder, min, max, player_selection);
    return (
      <section className="middle_part_login mt-4">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>New Challenge</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  {this.state.selected_team.removed ? (
                    <div className="alert alert-warning">
                      Team has already been deleted
                    </div>
                  ) : (
                    <form
                      onSubmit={this.handleCreation.bind(this)}
                      autoComplete="off"
                    >
                      {/*}<div className="form-group col-md-12">
                        <label htmlFor="title">Team</label>
                        <br />
                        <strong>{this.state.selected_team.title}</strong>
                      </div>
                      <br />
                      */}

                      <div className="form-group col-md-12">
                        <label htmlFor="team_id">Challenging {this.props.params.ctype == 'u' ? "user": 'team'}</label>
                        <input
                          type="text"
                          className="form-control"
                          disabled
                          value={this.state.challenging}
                        />
                      </div>

                      <div className="form-group col-md-12">
                        <label htmlFor="team_id">Your Team</label>
                        <select
                          className="form-control"
                          required="required"
                          name="team_id"
                          id="team_id"
                          onChange={e => {
                            this.handleChange(e);
                            const a = parseInt(e.target.value);

                            let m = this.state.eligible_teams.filter(function(
                              item
                            ) {
                              if (item.team_id == a) {
                                return true;
                              }
                              return false;
                            });
                            if (m.length) {
                              m = m[0];
                            } else {
                              m = null;
                            }

                            this.setState({
                              selected_team_data: m,
                              selected_team: m ? m.team_info : [],
                              ladder: m ? m.team_info.ladder_id : null,
                              using_users: []
                            });
                          }}
                        >
                          <option value="">Select Team</option>
                          {this.state.eligible_teams.map((team, i) => {
                            if (team.removed) {
                              return false;
                            }
                            team = team.team_info;
                            if (team.removed) {
                              return false;
                            }
                            if (team.team_type != 'matchfinder') {
                              return false;
                            }
                            // console.log(team);
                            if (
                              this.props.params &&
                              // this.props.params.type == 'g' &&
                              this.props.params.game_id &&
                              this.props.params.ladder_id
                            ) {
                              if (
                                team.ladder.game_id !=
                                parseInt(this.props.params.game_id)
                              ) {
                                return false;
                              }
                              if (
                                team.ladder.id !=
                                parseInt(this.props.params.ladder_id)
                              ) {
                                return false;
                              }
                              // if(this.state.team_id != team.id)
                              // setTimeout(function(){
                              //   jQuery('#team_id').val(team.id).change();
                              // }, 50)
                            }
                            // console.log(team);
                            return (
                              <option key={team.id} value={team.id}>
                                {team.title} - [ {team.ladder.game_info.title}
                                {' - '}
                                {team.ladder.title} ]
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      {/*}
                      <div className="form-group col-md-12">
                        <label htmlFor="title">Team Ladder</label>

                        <select
                          className="form-control"
                          required="required"
                          name="ladder"
                          id="ladder"
                          value={this.state.ladder}
                          onChange={e => {
                            this.handleChange(e);
                            const {eligible_teams} = this.state;
                            let team_changed = false;
                            for (let i = 0; i < eligible_teams.length; i++) {
                              if (
                                eligible_teams[i].removed ||
                                !eligible_teams[i].team_info ||
                                eligible_teams[i].team_info.removed ||
                                eligible_teams[i].team_info.ladder_id !=
                                  parseInt(e.target.value)
                              ) {
                                continue;
                              }
                              if (
                                eligible_teams[i].team_info.ladder_id ==
                                  parseInt(e.target.value) &&
                                eligible_teams[i].team_info.team_type ==
                                  'matchfinder'
                              ) {
                                // obj.team_selected = json.teams[0].team_info;
                                this.setState({
                                  selected_team_data: eligible_teams[i],
                                  selected_team: eligible_teams[i].team_info,
                                  using_users: []
                                });
                                // console.log(eligible_teams[i]);
                                // console.log(eligible_teams[i].team_info);
                                team_changed = true;
                              }
                            }
                            if (!team_changed) {
                              this.setState({
                                using_users: [],
                                selected_team_data: {
                                  team_info: {
                                    ladder: {title: ''},
                                    team_users: [],
                                    title: ''
                                  }
                                },
                                selected_team: {
                                  ladder: {title: ''},
                                  team_users: [],
                                  title: ''
                                }
                              });
                            }
                          }}
                        >
                          <option value="">Select Ladder</option>
                          {this.state.games.map((game, i) => {
                            if (!game.ladders || !game.ladders.length) {
                              return false;
                            }
                            return (
                              <optgroup label={game.title} key={game.id}>
                                {game.ladders.map((ladder, j) => {
                                  return (
                                    <option value={ladder.id} key={ladder.id}>
                                      {game.title + ' @ ' + ladder.title}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            );
                          })}
                          }
                        </select>
                      </div>*/}
                      <br />
                      <div className="form-group col-md-12">
                        <label htmlFor="title">User Id Required</label>
                        <div>
                          {!this.state.ladder ? ' - ' : this.showGamerTag()}
                        </div>
                      </div>
                      {/*}
                      <br />
                      <div className="form-group col-md-12">
                        <label htmlFor="title">Team Id for Match</label>
                        <div>
                          {this.state.selected_team &&
                          this.state.selected_team.id ? (
                            this.state.selected_team.title
                          ) : this.state.ladder ? (
                            <span className="text-danger">
                              No team exists for this ladder -{' '}
                              <Link
                                to={
                                  '/u/' +
                                  this.props.user.username +
                                  '/teams/new'
                                }
                                className="text-primary"
                              >
                                Create team
                              </Link>
                            </span>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>*/}
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
                            className="form-control nobrd"
                            name="match_starts_in"
                            disabled
                            id="match_starts_in"
                            onChange={this.handleChange.bind(this)}
                            value={this.state.match_starts_in}
                          >
                            <option value="">{'Select'}</option>
                            <option value="24|hours">Available Now</option>
                            {/*     <option value="10|minutes">In 10 minutes</option>
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
                        {this.state.match_starts_in == '24|hours' ? (
                          <span>
                            This challenge will remain active for 1 day for
                            other team to accept or reject the challenge. If the
                            other team fails to accept it, the challenge will be
                            automatically cancelled.
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                      {/*}
                      <div className="form-group col-md-12">
                        <label htmlFor="title">Match Availability</label>
                        <select
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
                        </select>
                      </div>*/}
                      <div className="form-group col-md-12 region_input">
                        <label htmlFor="title">Match Region</label>

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
                          All Regions <i className="fa fa-globe" />
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
                            step="0.1"
                            id="match_fee"
                            className="form-control"
                            onChange={this.handleChange.bind(this)}
                            required
                            placeholder="Match Fees"
                            name="match_fee"
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
                            score of pending match before creating a new
                            challenge.
                          </span>
                        ) : (
                          false
                        )}
                        {this.state.has_pending_disputes ? (
                          <span className="text-danger">
                            You have high number of open disputes. You can only
                            create a new challenge once your dispute count is
                            less than 3
                          </span>
                        ) : (
                          false
                        )}
                      </div>
                    </form>
                  )}
                  {!this.state.selected_team ||
                  this.state.selected_team.removed ? (
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
                                          this.state.ladder_obj.gamer_tag
                                        ]
                                      }
                                    />
                                    {
                                      this.tag_names[
                                        this.state.ladder_obj.gamer_tag
                                      ]
                                    }
                                  </th>
                                  <th>Eligibility</th>
                                  <th>Include</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.selected_team_data &&
                                  this.state.selected_team_data.team_info.team_users.map(
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
                                            {team_user.user_info.prime && (
                                              <img
                                                src={
                                                  '/assets/icons/ocg_member_' +
                                                  team_user.user_info
                                                    .prime_type +
                                                  '.png'
                                                }
                                                className="inline-star"
                                              />
                                            )}
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
                                            this.state.selected_team
                                              .team_creator
                                              ? 'Leader'
                                              : 'Member'}
                                          </td>
                                          <td>
                                            {team_user.user_info[
                                              'gamer_tag_' +
                                                this.state.ladder_obj.gamer_tag
                                            ] ? (
                                              team_user.user_info[
                                                'gamer_tag_' +
                                                  this.state.ladder_obj
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
                                                  !this.amIEligibleFlag(
                                                    team_user
                                                  )
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
export default connect(mapStateToProps)(NewMatchTeamSelect);
