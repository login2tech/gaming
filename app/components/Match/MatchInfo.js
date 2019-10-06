import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
import {join_match, saveScores} from '../../actions/match';
import game_user_ids from '../../../config/game_user_ids';
import Messages from '../Modules/Messages';

class MatchInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      is_loaded: false,
      match: {
        game: {},
        ladder: {},
        team_1_info: {team_users: []},
        team_2_info: {team_users: []}
      },
      ladder: '',
      using_users: [],
      games: [],
      clicked: false,
      my_score: '',
      their_score: ''
    };
  }

  showGamerTag() {
    return game_user_ids.tag_names[this.state.match.ladder.gamer_tag];
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  agreeToTermsForMatchJoin(event) {
    event.preventDefault();

    this.props.dispatch(
      join_match(
        {
          team_2_id: this.state.team_selected.id,
          match_id: this.state.match.id,
          using_users: this.state.using_users
        },
        this.props.user
      )
    );

    // diptach
  }

  isEligible() {
    //alert();
    if (this.state.match.match_type == '' || this.state.match.starts_at == '') {
      return false;
    }

    // console.log(this.state.match.match_players, this.state.using_users.length)
    if (
      parseInt(this.state.match.match_players) != this.state.using_users.length
    ) {
      return false;
    }

    if (this.state.match_type == 'free') {
      return true;
    }
    if (
      this.state.match.match_type == 'paid' &&
      (this.state.match.match_fee == '' ||
        parseFloat(this.state.match.match_fee) <= 0)
    ) {
      return false;
    }

    const amount = parseFloat(this.state.match.match_fee);
    for (let i = 0; i < this.state.team_selected.team_users.length; i++) {
      if (
        this.state.using_users.indexOf(
          this.state.team_selected.team_users[i].user_info.id
        ) <= -1
      ) {
        // this user is not playing, no need to check it's eligibility;
        continue;
      }
      if (
        parseFloat(
          this.state.team_selected.team_users[i].user_info.cash_balance
        ) < amount
      ) {
        return false;
      }
    }
    return true;
  }

  amIEligibleFlag(team_u) {
    if (this.state.match.match_type == '') {
      return false;
    }
    const gamer_tag = this.state.match.ladder.gamer_tag;
    if (!team_u.user_info['gamer_tag_' + gamer_tag]) {
      return false;
    }
    if (this.state.match_type == '') {
      return false;
    }
    const amount = parseFloat(this.state.match.match_fee);

    if (this.state.match.match_type == 'free') {
      return true;
    }

    if (parseFloat(team_u.user_info.cash_balance) < amount) {
      return false;
    }
    return true;
  }

  amIEligible(team_u) {
    if (this.state.match.match_type == '') {
      return '--';
    }
    if (!team_u.user_info['gamer_tag_' + this.state.match.ladder.gamer_tag]) {
      return (
        <span className="text-danger">
          <img src="/images/controller-red.svg" className="icon_size" /> Not
          Eligible
        </span>
      );
    }

    if (this.state.match.match_type == 'free') {
      return (
        <span className="text-success">
          <img src="/images/controller-green.svg" className="icon_size" />{' '}
          Eligible
        </span>
      );
    }

    const amount = parseFloat(this.state.match.match_fee);

    if (parseFloat(team_u.user_info.cash_balance) < amount) {
      return (
        <span className="text-danger">
          <img src="/images/controller-red.svg" className="icon_size" /> Not
          Eligible
        </span>
      );
    }
    return (
      <span className="text-success">
        <img src="/images/controller-green.svg" className="icon_size" />{' '}
        Eligible
      </span>
    );
  }

  componentDidMount() {
    fetch('/api/matches/single/' + this.props.params.match_id)
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

  matchLink(orign) {
    if (this.props.user) {
      return orign;
    }
    return '/login';
  }

  saveScore() {
    if (!this.props.user) {
      return false;
    }
    // const scrore = '';
    const val = {};
    const me = this.props.user.id;

    if (
      me == this.state.match.team_1_info.team_creator &&
      !this.state.match.team_1_result
    ) {
      val.team_1_result =
        '' + this.state.my_score + '-' + this.state.their_score;
    }

    if (
      me == this.state.match.team_2_info.team_creator &&
      !this.state.match.team_2_result
    ) {
      val.team_2_result =
        '' + this.state.their_score + '-' + this.state.my_score;
    }
    val.id = this.state.match.id;
    //console.log(val);
    this.props.dispatch(saveScores(val, this.props.user));
  }

  showMatch() {
    if (!this.props.user) {
      return;
    }
    fetch(
      '/api/teams/team_of_user/?uid=' +
        this.props.user.id +
        '&filter_ladder=' +
        this.state.match.ladder_id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const obj = {eligible_teams: json.teams, eligible_teams_loaded: true};
          if (json.teams && json.teams.length && json.teams[0].removed != 1) {
            obj.team_selected = json.teams[0].team_info;
          }

          this.setState(obj, () => {
            // scroll
            const element = document.getElementById('tlst');
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
              });
            }
          });
        }
      });
  }

  renderJoin() {
    if (this.state.clicked) {
      return false;
    }

    if (!this.state.is_loaded) {
      return false;
    }
    if (this.state.match.team_2_id) {
      return false;
    }

    if (!this.props.user) {
      return false;
    }
    // return false;
    const me = this.props.user.id;
    // let team_1_players = this.state.match.team_1_players.split('|');
    const team_1_players = this.state.match.team_1_info.team_users;

    for (let i = 0; i < team_1_players.length; i++) {
      // console.log(users);
      // console.log(users[i].id, me);
      if (parseInt(team_1_players[i].user_id) == me) {
        console.log(team_1_players[i], me);
        return false;
      }
    }
    //
    return (
      <button
        type="button"
        onClick={() => {
          this.setState(
            {
              clicked: true
            },
            () => {
              this.showMatch();
            }
          );
        }}
        className="btn btn-default bttn_submit mw_200"
      >
        Accept Match
      </button>
    );
  }

  dynamicStatus() {
    if (!this.state.match.team_2_id) {
      return 'Expired';
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

  renderScoreSubmit() {
    if (!this.props.user) {
      return false;
    }
    if (!this.state.match.team_1_id || !this.state.match.team_2_id) {
      return false;
    }
    if (!moment().isAfter(moment(this.state.match.starts_at))) {
      return false;
    }
    const me = this.props.user.id;
    if (
      me != this.state.match.team_1_info.team_creator &&
      this.state.match.team_2_info.team_creator != me
    ) {
      return false;
    }

    if (
      me == this.state.match.team_1_info.team_creator &&
      this.state.match.team_1_result
    ) {
      return (
        <p className="alert alert-info">
          You have updated score as {this.state.match.team_1_result}
        </p>
      );
    }

    if (
      me == this.state.match.team_2_info.team_creator &&
      this.state.match.team_2_result
    ) {
      return (
        <p className="alert alert-info">
          You have updated score as {this.state.match.team_2_result}
        </p>
      );
    }

    // i have submitted?

    //
    // my_score
    // their_score

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

  render() {
    const divStyle =
      this.state.match &&
      this.state.match.game &&
      this.state.match.game.banner_url
        ? {
            backgroundImage: 'url(' + this.state.match.game.banner_url + ')'
          }
        : {};

    const team_1_players =
      this.state.match && this.state.match.team_1_players
        ? this.state.match.team_1_players.split('|')
        : [];
    const team_2_players =
      this.state.match && this.state.match.team_2_players
        ? this.state.match.team_2_players.split('|')
        : [];
    return (
      <div>
        <section className="page_title_bar" style={divStyle}>
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <div className="match_heading">
                    <h4>Match</h4>
                  </div>
                  <span className="vs_match">
                    <Link to={'/teams/view/' + this.state.match.team_1_info.id}>
                      {this.state.match.team_1_info.title}
                    </Link>{' '}
                    VS{' '}
                    {this.state.match.team_2_id ? (
                      <Link
                        to={'/teams/view/' + this.state.match.team_2_info.id}
                      >
                        {this.state.match.team_2_info.title}
                      </Link>
                    ) : (
                      <span className="text-grey">Pending Team</span>
                    )}
                  </span>
                  <span className="game_station">
                    <span
                      className={
                        game_user_ids.tag_icons[
                          this.state.match.ladder.gamer_tag
                        ] + ' float-none'
                      }
                    />{' '}
                    {this.state.match.game.title} @{' '}
                    {this.state.match.ladder.title}
                  </span>
                  <div className="match_start_date">
                    {moment().isAfter(moment(this.state.match.starts_at))
                      ? 'Match Started:'
                      : 'Match Starts'}{' '}
                    {moment(this.state.match.starts_at).format('lll')} ({' '}
                    {moment(this.state.match.starts_at).fromNow()} )
                  </div>
                  <div className="twovstwo">
                    {this.state.match.match_players} VS{' '}
                    {this.state.match.match_players} MATCH
                  </div>
                  {/* <div className="rules_point">
                    <ul>
                      <li>
                        <a href="#">View Rules</a>
                      </li>
                    </ul>
                  </div> */}
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MATCH ID</span>
                        <p>#{this.state.match.id}</p>
                      </div>

                      <div className="col-md-4">
                        <span> STATUS</span>
                        <p>
                          {moment().isAfter(moment(this.state.match.starts_at))
                            ? this.dynamicStatus()
                            : this.state.match.status}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <span>TYPE</span>
                        <p>
                          {this.state.match.match_type == 'paid'
                            ? 'CASHOUT'
                            : 'LADDER'}
                        </p>
                      </div>
                    </div>
                    {this.renderJoin()}
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
                {this.renderScoreSubmit()}

                {/*}   <h5 className="prizes_desclaimer">Match Rules</h5>
                <div className="list_pad">
                <div className="row">
                   <div className="col-md-6">
                      <span>HOST</span>
                      <p>
                        ound 1: TBD
                        <br />
                        Round 2: TBD
                        <br />
                        Round 3: TBD
                      </p>
                    </div>

                    <div className="col-md-6">
                      <span> Maps</span>
                      <p>
                        Round 1: Battle Royale
                        <br />
                        Round 2: Battle Royale
                        <br />
                        Round 3: Battle Royale
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <span>MATCH SET</span>
                      <p>Best Of 3</p>
                    </div>

                    <div className="col-md-6">
                      <span> GAME TYPE</span>
                      <p>Battle Royale</p>
                    </div>
                  </div>
                </div>

                <hr />

                <h5 className="prizes_desclaimer">Match Options</h5>

                <div className="list_pad">
                  <div className="row">
                    <div className="col-md-6">
                      <span>DETAILS</span>
                      <p>Game Mode - Battle Royale</p>
                    </div>

                    <div className="col-md-6" />
                  </div>
                </div>
                <hr />
                */}

                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-users" aria-hidden="true" /> SQUAD
                  </h5>
                  <br />
                  {this.state.match.status != 'pending' ? (
                    <>
                      <h6 className="prizes_desclaimer">
                        <Link to={'/teams/view/' + this.state.match.team_1_id}>
                          {this.state.match.team_1_info.title}
                        </Link>
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
                      </h6>

                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>{this.showGamerTag()}</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.match.team_1_info.team_users.map(
                            (team_user, i) => {
                              if (
                                team_1_players.indexOf(
                                  '' + team_user.user_info.id
                                ) < 0
                              ) {
                                return false;
                              }
                              return (
                                <tr key={team_user.id}>
                                  <td>
                                    <Link
                                      target="_blank"
                                      to={'/u/' + team_user.user_info.username}
                                    >
                                      {team_user.user_info.username}
                                    </Link>
                                  </td>
                                  <td>
                                    {team_user.user_info[
                                      'gamer_tag_' +
                                        this.state.match.ladder.gamer_tag
                                    ] ? (
                                      team_user.user_info[
                                        'gamer_tag_' +
                                          this.state.match.ladder.gamer_tag
                                      ]
                                    ) : (
                                      <span className="text-danger">
                                        No UserId
                                      </span>
                                    )}
                                  </td>

                                  <td>
                                    {team_user.user_id ==
                                    this.state.match.team_1_info.team_creator
                                      ? 'Leader'
                                      : 'Member'}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>

                      <br />
                      {this.state.match.team_2_id ? (
                        <div>
                          <h6 className="prizes_desclaimer">
                            <Link
                              to={'/teams/view/' + this.state.match.team_2_id}
                            >
                              {this.state.match.team_2_info.title}
                            </Link>{' '}
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
                            {this.state.match.status == 'complete' &&
                            this.state.match.result == 'team_1' ? (
                              <span>
                                {' '}
                                - <span className="text text-danger">L</span>
                              </span>
                            ) : (
                              false
                            )}
                          </h6>
                          <table className="table table-striped table-ongray table-hover">
                            <thead>
                              <tr>
                                <th>Username</th>
                                <th>{this.showGamerTag()}</th>
                                <th>Role</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.match.team_2_info.team_users.map(
                                (team_user, i) => {
                                  if (
                                    team_2_players.indexOf(
                                      '' + team_user.user_info.id
                                    ) < 0
                                  ) {
                                    return false;
                                  }
                                  return (
                                    <tr key={team_user.id}>
                                      <td>
                                        <Link
                                          to={
                                            '/u/' + team_user.user_info.username
                                          }
                                        >
                                          {team_user.user_info.username}
                                        </Link>
                                      </td>
                                      <td>
                                        {team_user.user_info[
                                          'gamer_tag_' +
                                            this.state.match.ladder.gamer_tag
                                        ] ? (
                                          team_user.user_info[
                                            'gamer_tag_' +
                                              this.state.match.ladder.gamer_tag
                                          ]
                                        ) : (
                                          <span className="text-danger">
                                            No User id
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        {team_user.user_id ==
                                        this.state.match.team_2_info
                                          .team_creator
                                          ? 'Leader'
                                          : 'Member'}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        false
                      )}
                    </>
                  ) : (
                    <div className="alert alert-info">
                      Team details will be visible once the match is accepted.
                    </div>
                  )}
                </div>
                <br />
                {this.renderJoin()}
                <br />

                {this.state.team_selected ? (
                  <div>
                    {/*}<button
                      className="  btn btn-primary btn-sm max-width-300"
                      onClick={() => {
                        this.setState({
                          team_selected: false
                        });
                      }}
                    >
                      <i className="fa fa-arrow-left" /> back to team list
                    </button>
                    <br />*/}
                    <form
                      onSubmit={event => {
                        this.agreeToTermsForMatchJoin(event);
                      }}
                    >
                      <h6 className="prizes_desclaimer">
                        {this.state.team_selected.title} - Squad
                      </h6>
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Eligibility</th>
                            <th>Include</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.team_selected.team_users.map(
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
                                      to={'/u/' + team_user.user_info.username}
                                    >
                                      {team_user.user_info.username}
                                    </Link>
                                  </td>

                                  <td>
                                    {team_user.user_id ==
                                    this.state.team_selected.team_creator
                                      ? 'Leader'
                                      : 'Member'}
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
                      <br />
                      <label>
                        <input type="checkbox" required /> I agree to the terms
                        to accept this match.
                      </label>
                      <br />
                      <br />

                      <button
                        disabled={!this.isEligible()}
                        type="submit"
                        // disable={!this.isEligible.bind(this)}
                        className="btn btn-primary max-width-300"
                      >
                        Accept Match
                      </button>
                    </form>
                  </div>
                ) : (
                  false
                )}

                <ul className="team_list" id="tlst">
                  {this.state.eligible_teams_loaded &&
                    !this.state.team_selected &&
                    this.state.eligible_teams.map((team_parent, i) => {
                      if (team_parent.team_info.removed) {
                        return false;
                      }
                      if (
                        team_parent.team_info.ladder_id !=
                        this.state.match.ladder_id
                      ) {
                        return false;
                      }
                      const team = team_parent.team_info
                        ? team_parent.team_info
                        : {};
                      if (team.removed == 1) {
                        return false;
                      }
                      return (
                        <li className="" key={team.id}>
                          <Link
                            // to={
                            //   '/u/' +
                            //   this.state.user_info.username +
                            //   '/teams/' +
                            //   team.id
                            // }
                            onClick={() => {
                              this.setState({
                                team_selected: team
                              });
                            }}
                          >
                            <img src="/images/team_bg.png" />
                            <div className="info">{team.title}</div>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
                {this.state.eligible_teams_loaded &&
                  !this.state.team_selected && (
                    <div className="alert alert-warning">
                      You dont have a team for this ladder
                    </div>
                  )}
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
export default connect(mapStateToProps)(MatchInfo);
