import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
import {
  join_match,
  saveScores,
  leave_match,
  rejectChallenge
} from '../../actions/match';
import game_user_ids from '../../../config/game_user_ids';
import Messages from '../Modules/Messages';
import GameRules from '../Modules/GameRules';
import utils from '../../utils';
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
    const tg = game_user_ids.tag_names[this.state.match.ladder.gamer_tag];
    return (
      <>
        <span
          className={game_user_ids.tag_icons[this.state.match.ladder.gamer_tag]}
        />
        {tg == 'Activision ID' ? 'ID' : tg}
      </>
    );
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

  rejectChallenge(event) {
    event.preventDefault();

    this.props.dispatch(
      rejectChallenge(
        {
          match_id: this.state.match.id
        },
        this.props.user
      )
    );
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
        <span
          className="text-danger"
          data-toggle="tooltip"
          title="GamerTag does not exist"
        >
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
          <img src="/images/controller-red.svg" className="icon_size" /> Not
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
          title="Not Enough OCG Cash Balance"
          data-toggle="tooltip"
          title="Not Enough Credit Balance"
        >
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
              if (json.item.is_challenge) {
                this.loadTeams();
              }
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
        '' + this.state.my_score + '-' + this.state.their_score;
    }
    val.id = this.state.match.id;
    //console.log(val);
    this.props.dispatch(saveScores(val, this.props.user));
  }

  loadTeams() {
    fetch(
      '/api/teams/team_of_user/?filter_actives=yes&uid=' + this.props.user.id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const obj = {
            eligible_teams: json.teams ? json.teams : []
          };
          this.setState(obj);
        }
      });
  }

  showMatch() {
    if (!this.props.user) {
      return;
    }
    fetch(
      '/api/teams/team_of_user/?filter_actives=yes&uid=' +
        this.props.user.id +
        '&filter_ladder=' +
        this.state.match.ladder_id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const obj = {
            eligible_teams: json.teams ? json.teams : [],
            eligible_teams_loaded: true
          };

          if (json.teams && json.teams.length) {
            for (let i = 0; i < json.teams.length; i++) {
              if (
                json.teams[i].removed ||
                !json.teams[i].team_info ||
                json.teams[i].team_info.removed ||
                json.teams[i].team_info.ladder_id !=
                  this.state.match.ladder_id ||
                json.teams[i].team_info.team_type != 'matchfinder'
              ) {
                continue;
              }
              // console.log(json.teams[i]);
              // if (
              //   json.teams[i].team_info.ladder_id != this.state.match.ladder_id
              // ) {
              //   obj.team_selected = json.teams[0].team_info;
              // }

              if (
                json.teams[i].team_info.ladder_id == this.state.match.ladder_id
              ) {
                obj.team_selected = json.teams[i].team_info;
              }
            }
          }
          //
          // if (json.teams && json.teams.length && json.teams[0].removed != 1) {
          //   obj.team_selected = json.teams[0].team_info;
          // }

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

  leaveMatchRequest(e, type) {
    this.props.dispatch(
      leave_match(
        {
          match_id: this.state.match.id,
          do_cancel: type ? true : false,
          team:
            this.state.match.team_1_info.team_creator == this.props.user.id
              ? 'team_1'
              : 'team_2'
        },
        this.props.user
      )
    );
  }

  renderRequestCancel() {
    if (this.state.clicked) {
      return false;
    }

    if (!this.state.is_loaded) {
      return false;
    }
    if (!this.state.match.team_2_id) {
      return false;
    }
    if (!this.props.user) {
      return false;
    }
    // if (this.props.result) {
    //   return false;
    // }
    if (
      this.state.match.status == 'cancelled' ||
      this.state.match.status == 'disputed' ||
      this.state.match.status == 'complete'
    ) {
      return false;
    }
    if (this.state.match.cancel_requested) {
      if (
        (this.state.match.cancel_requested_by == 'team_1' &&
          this.state.match.team_2_info.team_creator == this.props.user.id) ||
        (this.state.match.cancel_requested_by == 'team_2' &&
          this.state.match.team_1_info.team_creator == this.props.user.id)
      ) {
        return (
          <div className="btn-group">
            <button
              type="button"
              onClick={e => {
                this.leaveMatchRequest(e);
              }}
              className="btn btn-danger bttn_submit"
              style={{width: 'auto'}}
            >
              Accept cancellation
            </button>
            <button
              type="button"
              onClick={e => {
                this.leaveMatchRequest(e, true);
              }}
              className="btn btn-primary bttn_submit mw_200"
            >
              X
            </button>
          </div>
        );
      }
      //
      // .
      return false;
    }

    // console.log(this.state.match.team_1_info);
    if (
      this.state.match.team_1_info.team_creator == this.props.user.id ||
      this.state.match.team_2_info.team_creator == this.props.user.id
    ) {
      if (this.state.confirmLeave) {
        return (
          <div className="btn-group">
            <button
              type="button"
              onClick={e => {
                this.leaveMatchRequest(e);
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
        <button
          type="button"
          onClick={() => {
            this.setState({confirmLeave: true});
          }}
          className="btn btn-danger bttn_submit"
          style={{width: 'auto'}}
        >
          Request cancellation
        </button>
      );
    }
    return false;
  }

  myTeamName() {
    if (!this.props.user) {
      return false;
    }
    const team_1_players =
      this.state.match && this.state.match.team_1_players
        ? this.state.match.team_1_players.split('|')
        : [];
    const team_2_players =
      this.state.match && this.state.match.team_2_players
        ? this.state.match.team_2_players.split('|')
        : [];

    const me = '' + this.props.user.id;
    if (team_1_players.indexOf(me) > -1) {
      return this.state.match.team_1_info.title;
    }
    if (team_2_players.indexOf(me) > -1) {
      return this.state.match.team_2_info.title;
    }
    return '';
  }

  renderTicketCreate() {
    if (this.state.match.status != 'disputed') {
      return false;
    }
    return (
      <div>
        <a
          onClick={e => {
            if (
              this.state.match.team_1_info &&
              this.state.match.team_1_info.team_creator == this.props.user.id
            ) {
              return true;
            }
            if (
              this.state.match.team_2_info &&
              this.state.match.team_2_info.team_creator == this.props.user.id
            ) {
              return true;
            }
            e.preventDefault();
            alert('Please ask the team leader to raise dispute.');
            return false;
          }}
          href={
            '/support/tickets/create/m/disputed/' +
            this.state.match.id +
            '/' +
            this.myTeamName() +
            ''
          }
          className="btn btn-primary bttn_submit dib"
          style={{width: 'auto'}}
        >
          Create Ticket to resolve dispute
        </a>
      </div>
    );
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
    if (this.state.match.status == 'cancelled') {
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
        // console.log(team_1_players[i], me);
        return false;
      }
    }
    if (this.state.match.is_challenge) {
      if (this.state.match.challenge_type == 't') {
        if (this.state.eligible_teams) {
          // console.log(this.state.eligible_teams)
          const my_team_ids = this.state.eligible_teams.map(function(item) {
            return item.id;
          });
          if (my_team_ids.indexOf(this.state.match.challenge_for) > -1) {
            //
          } else {
            return false;
          }
          // console.log(my_team_ids)
        }
      } else if (this.state.match.challenge_type == 'u') {
        if (this.state.match.challenge_for_u == this.props.user.id) {
          //
        } else {
          return false;
        }
      }
    } else {
      return false;
    }

    return (
      <>
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
          className="btn btn-default bttn_submit mw_200 dib mr-2"
        >
          Accept {this.state.match.is_challenge ? 'challenge' : 'match'}
        </button>
        {this.state.match.is_challenge ? (
          <button
            onClick={() => {
              this.rejectChallenge(event);
            }}
            type="button"
            className="btn btn-danger mt-4 mw_200"
          >
            Reject
          </button>
        ) : (
          false
        )}
      </>
    );
  }

  dynamicStatus() {
    const {match} = this.state;
    if (!match.team_2_id) {
      return 'Expired';
    }
    if (match.status == 'cancelled') {
      return 'Cancelled';
    }
    if (match.status == 'disputed') {
      return 'Disputed';
    }
    if (match.result == 'disputed') {
      return 'Disputed';
    }

    let result;
    if (match.result) {
      if (match.result == 'tie') {
        result = 'Tie';
      } else {
        if (match.result == 'team_1') {
          result = match.team_1_info.title + ' Wins';
        } else if (match.result == 'team_2') {
          result = match.team_2_info.title + ' Wins';
        }
      }

      return 'Complete - ' + result;
    }

    if (!match.team_1_result && !match.team_2_result) {
      return 'Pending Results';
    }

    if (!match.team_1_result || !match.team_2_result) {
      return 'Pending Results Confirmation';
    }
  }

  renderScoreSubmit() {
    const {match} = this.state;
    if (!this.props.user) {
      return false;
    }

    if (!match.team_1_id || !match.team_2_id) {
      return false;
    }
    if (!moment().isAfter(moment(match.starts_at))) {
      return false;
    }
    const me = this.props.user.id;
    if (
      me != match.team_1_info.team_creator &&
      match.team_2_info.team_creator != me
    ) {
      return false;
    }
    if (
      match.status == 'cancelled' ||
      match.status == 'disputed' ||
      match.status == 'complete'
    ) {
      return false;
    }

    if (me == match.team_1_info.team_creator && match.team_1_result) {
      return (
        <p className="alert alert-info">
          You have updated score as {match.team_1_result}
        </p>
      );
    }

    if (me == match.team_2_info.team_creator && match.team_2_result) {
      return (
        <p className="alert alert-info">
          You have updated score as {match.team_2_result}
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
    const {match} = this.state;

    const divStyle =
      match && match.game && match.game.banner_2_url
        ? {
            backgroundImage: 'url(' + match.game.banner_2_url + ')',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            minHeight: '400px'
          }
        : {};

    const team_1_players =
      match && match.team_1_players ? match.team_1_players.split('|') : [];
    const team_2_players =
      match && match.team_2_players ? match.team_2_players.split('|') : [];
    let game_settings =
      match && match.game_settings ? JSON.parse(match.game_settings) : {};
    if (!game_settings) {
      game_settings = {};
    }
    const game_settings_keys = Object.keys(game_settings);
    if (!match.id) {
      return (
        <div className="text-center text-lg p-5">
          <span className="fa fa-spin fa-spinner" style={{fontSize: 100}} />
        </div>
      );
    }
    return (
      <div>
        <section
          className="page_title_bar single-finder-match"
          style={divStyle}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <div className="row bbt">
                    <div className="col col-md-1">
                      <span
                        className={
                          game_user_ids.tag_icons[match.ladder.gamer_tag] +
                          ' pf_icon_big'
                        }
                      />
                    </div>
                    <div className="col col-md-3">
                      <div className="match_heading">
                        <h4>{match.is_challenge ? 'Challenge' : 'Match'}</h4>
                      </div>
                      <div className="twovstwo">
                        {match.match_players} VS {match.match_players} MATCH
                      </div>
                    </div>

                    <div className="col-12 col-md-7 pt-3">
                      <span className="vs_match">
                        <Link to={'/teams/view/' + match.team_1_info.id}>
                          {match.team_1_info.title}
                        </Link>{' '}
                        VS{' '}
                        {match.team_2_id ? (
                          <Link to={'/teams/view/' + match.team_2_info.id}>
                            {match.team_2_info.title}
                          </Link>
                        ) : match.is_challenge ? (
                          <span className="text-grey">Waiting Acceptance</span>
                        ) : (
                          <span className="text-grey">Pending Team</span>
                        )}
                      </span>
                      <span className="game_station">
                        {match.game.title} @ {match.ladder.title}
                      </span>
                      <div className="match_start_date">
                        {match.is_available_now
                          ? 'AVAILABLE NOW'
                          : moment().isAfter(moment(match.starts_at))
                          ? 'Match Started:'
                          : 'Match Starts'}{' '}
                        {match.is_available_now
                          ? ' '
                          : moment(match.starts_at).format('lll')}{' '}
                        {match.is_available_now
                          ? ''
                          : '  (' + moment(match.starts_at).fromNow() + ')'}
                      </div>
                      <span className="flat_right">
                        <strong>Region: </strong>
                        {game_settings && game_settings['match_available']
                          ? utils.getCountryImage(
                              game_settings['match_available']
                            )
                          : ''}
                      </span>
                    </div>
                  </div>
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-4">
                        <span> MATCH ID</span>
                        <p>#{match.id}</p>
                      </div>

                      <div className="col-4">
                        <span> STATUS</span>
                        <p className={'m_status status_' + match.status}>
                          {moment().isAfter(moment(match.starts_at))
                            ? this.dynamicStatus()
                            : match.status}
                        </p>
                      </div>

                      <div className="col-4">
                        <span>MATCH FEE</span>
                        <p>
                          {match.match_type == 'free' ? (
                            'FREE'
                          ) : (
                            <span>
                              {'PAID (' +
                                (match.match_type == 'cash'
                                  ? '' + match.match_fee + '$'
                                  : '' + match.match_fee + ' credits') +
                                ')'}
                              {utils.feeIcon(match.match_type)}
                            </span>
                          )}
                        </p>
                      </div>
                      {game_settings_keys.map((k, i) => {
                        if (k == 'match_available') {
                          return false;
                        }
                        const m = k.replace(new RegExp('_', 'g'), ' ');
                        // if (m.toLowerCase() === 'match available') {
                        //   m = 'Match Region';
                        // }
                        return (
                          <div className="col-md-4 col-6 textcap" key={k}>
                            <span>{m}</span>
                            <p>{game_settings[k]}</p>
                          </div>
                        );
                      })}
                    </div>
                    {this.renderRequestCancel()}
                    {this.renderTicketCreate()}
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
                <Messages messages={this.props.messages} />
                {this.renderScoreSubmit()}

                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-users" aria-hidden="true" /> SQUAD
                  </h5>
                  <br />
                  {match.status != 'pending' ? (
                    <>
                      <h6 className="prizes_desclaimer">
                        <Link to={'/teams/view/' + match.team_1_id}>
                          {match.team_1_info.title}
                        </Link>{' '}
                        <span className="text-primary">
                          {match.team_1_result}
                        </span>{' '}
                        {match.status == 'complete' &&
                        match.result == 'team_1' ? (
                          <span>
                            {' '}
                            - <span className="text text-success">W</span>
                          </span>
                        ) : (
                          false
                        )}
                        {(match.status == 'complete' ||
                          match.status == 'Complete') &&
                        match.result == 'team_2' ? (
                          <span>
                            {' '}
                            - <span className="text text-danger">L</span>
                          </span>
                        ) : (
                          false
                        )}
                      </h6>
                      <div className="table_wrapper">
                        <table className="table table-striped table-ongray table-hover">
                          <thead>
                            <tr>
                              <th style={{width: '40%'}}>Username</th>
                              <th
                                style={{width: '40%'}}
                                className={'act_pr' + match.ladder.gamer_tag}
                              >
                                {this.showGamerTag()}
                              </th>
                              <th style={{width: '20%'}}>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {match.team_1_info.team_users.map(
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
                                    <td
                                      className={
                                        team_user.user_info.prime
                                          ? ' is_prime_cell is_prime_type_' +
                                            team_user.user_info.prime_type
                                          : ''
                                      }
                                    >
                                      <Link
                                        target="_blank"
                                        to={
                                          '/u/' + team_user.user_info.username
                                        }
                                      >
                                        {team_user.user_info.username}
                                      </Link>
                                    </td>
                                    <td>
                                      {team_user.user_info[
                                        'gamer_tag_' + match.ladder.gamer_tag
                                      ] ? (
                                        team_user.user_info[
                                          'gamer_tag_' + match.ladder.gamer_tag
                                        ]
                                      ) : (
                                        <span className="text-danger">
                                          No UserId
                                        </span>
                                      )}
                                    </td>

                                    <td>
                                      {team_user.user_id ==
                                      match.team_1_info.team_creator
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
                      <br />
                      {match.team_2_id ? (
                        <div>
                          <h6 className="prizes_desclaimer">
                            <Link to={'/teams/view/' + match.team_2_id}>
                              {match.team_2_info.title}
                            </Link>{' '}
                            <span className="text-primary">
                              {match.team_2_result}
                            </span>{' '}
                            {(match.status == 'complete' ||
                              match.status == 'Complete') &&
                            match.result == 'team_2' ? (
                              <span>
                                {' '}
                                - <span className="text text-success">W</span>
                              </span>
                            ) : (
                              false
                            )}
                            {match.status == 'complete' &&
                            match.result == 'team_1' ? (
                              <span>
                                {' '}
                                - <span className="text text-danger">L</span>
                              </span>
                            ) : (
                              false
                            )}
                          </h6>
                          <div className="table_wrapper">
                            <table className="table table-striped table-ongray table-hover">
                              <thead>
                                <tr>
                                  <th style={{width: '40%'}}>Username</th>
                                  <th
                                    style={{width: '40%'}}
                                    className={
                                      'act_pr' +
                                      this.state.match.ladder.gamer_tag
                                    }
                                  >
                                    {this.showGamerTag()}
                                  </th>
                                  <th style={{width: '20%'}}>Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {match.team_2_info.team_users.map(
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
                                        <td
                                          className={
                                            team_user.user_info.prime
                                              ? ' is_prime_cell is_prime_type_' +
                                                team_user.user_info.prime_type
                                              : ''
                                          }
                                        >
                                          <Link
                                            to={
                                              '/u/' +
                                              team_user.user_info.username
                                            }
                                          >
                                            {team_user.user_info.username}
                                          </Link>
                                        </td>
                                        <td>
                                          {team_user.user_info[
                                            'gamer_tag_' +
                                              match.ladder.gamer_tag
                                          ] ? (
                                            team_user.user_info[
                                              'gamer_tag_' +
                                                match.ladder.gamer_tag
                                            ]
                                          ) : (
                                            <span className="text-danger">
                                              No User id
                                            </span>
                                          )}
                                        </td>
                                        <td>
                                          {team_user.user_id ==
                                          match.team_2_info.team_creator
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
                        </div>
                      ) : (
                        false
                      )}
                    </>
                  ) : (
                    <div className="alert alert-info">
                      {match.is_challenge
                        ? 'Team details will be visible once the challenge is accepted.'
                        : 'Team details will be visible once the match is accepted.'}
                    </div>
                  )}
                </div>
                <br />
                {this.renderJoin()}
                <br />

                {this.state.team_selected ? (
                  <div id="tlst">
                    <form
                      onSubmit={event => {
                        this.agreeToTermsForMatchJoin(event);
                      }}
                    >
                      <h6 className="prizes_desclaimer">
                        {this.state.team_selected.title} - Squad
                      </h6>
                      <div className="table_wrapper">
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
                                        to={
                                          '/u/' + team_user.user_info.username
                                        }
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
                      </div>
                      <br />
                      <label>
                        <input type="checkbox" required /> I agree to the terms
                        to accept this{' '}
                        {match.is_challenge ? 'challenge' : 'match'}.
                      </label>
                      <br />
                      <br />

                      <button
                        disabled={!this.isEligible()}
                        type="submit"
                        // disable={!this.isEligible.bind(this)}
                        className="btn btn-primary max-width-300"
                      >
                        Accept {match.is_challenge ? 'challenge' : 'match'}
                      </button>
                    </form>
                  </div>
                ) : (
                  false
                )}

                {this.state.eligible_teams_loaded && !this.state.team_selected && (
                  <div className="alert alert-warning" id="tlst">
                    You dont have a team for this ladder. Click{' '}
                    <Link
                      target="_blank"
                      to={
                        '/u/' +
                        this.props.user.username +
                        '/teams/new/l/' +
                        match.ladder.id
                      }
                    >
                      here
                    </Link>{' '}
                    to create a team.
                  </div>
                )}
              </div>
            </div>

            <GameRules title={this.state.match.game.title} />
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
