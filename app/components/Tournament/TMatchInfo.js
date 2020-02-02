import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
// import {join_match} from '../../actions/match';
import {saveScores} from '../../actions/tournament';

import game_user_ids from '../../../config/game_user_ids';
import Messages from '../Modules/Messages';

class TMatchInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      is_loaded: false,
      match: {
        tournament: {
          game: {},
          ladder: {}
        },
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
    const {match} = this.state;
    const tg = game_user_ids.tag_names[match.tournament.ladder.gamer_tag];
    return (
      <>
        <span
          className={game_user_ids.tag_icons[match.tournament.ladder.gamer_tag]}
        />
        {tg == 'Activision ID' ? 'ID' : tg}
      </>
    );
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    fetch('/api/tournaments/singlematch/' + this.props.params.match_id)
      .then(res => res.json())
      .then(json => {
        if (json.is_404) {
          window.location.href = '/404';
          return false;
        }
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

  showMatch() {
    if (!this.props.user) {
      return;
    }
    fetch(
      '/api/teams/team_of_user/?filter_actives=yes&uid=' +
        this.props.user.id +
        '&filter_ladder=' +
        this.state.match.tournament.ladder_id
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
                  this.state.match.tournament.ladder_id
              ) {
                continue;
              }
              // console.log(json.teams[i]);
              // if (
              //   json.teams[i].team_info.ladder_id != this.state.match.tournament.ladder_id
              // ) {
              //   obj.team_selected = json.teams[0].team_info;
              // }

              if (
                json.teams[i].team_info.ladder_id ==
                this.state.match.tournament.ladder_id
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
          href={
            '/support/tickets/create/t/disputed/' +
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

  dynamicStatus() {
    const match = this.state.match;
    if (!match.team_2_id) {
      return 'Expired';
    }
    if (match.result == 'disputed') {
      return 'Disputed';
    }
    if (match.status == 'complete') {
      return 'Complete';
    }
    if (!match.team_1_result && !match.team_2_result) {
      return 'Pending Results';
    }
    if (!match.team_1_result || !match.team_2_result) {
      return 'Pending Results Confirmation';
    }

    let result;

    if (match.result == 'tie') {
      result = 'Tie';
    } else {
      if (match.result == 'team_1') {
        result = match.team_1_info.title + ' Wins';
      } else {
        result = match.team_2_info.title + ' Wins';
      }
    }

    return 'Complete - ' + result;
  }

  renderScoreSubmit() {
    if (!this.props.user) {
      return false;
    }
    if (
      this.state.match.status == 'complete' ||
      this.state.match.status == 'disputed'
    ) {
      return false;
    }

    if (!this.state.match.team_1_id || !this.state.match.team_2_id) {
      return false;
    }
    if (!moment().isAfter(moment(this.state.match.starts_at))) {
      return (
        <span className="alert text-primary mb-3">
          Score can be submitted once the match starts.
        </span>
      );
    }

    const me = this.props.user.id;
    if (
      me != this.state.match.team_1_info.team_creator &&
      this.state.match.team_2_info.team_creator != me
    ) {
      return false;
    }
    if (this.state.match.status == 'cancelled') {
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
    const tournament = match.tournament;
    const divStyle =
      tournament.game && tournament.game.banner_url
        ? {
            backgroundImage: 'url(' + tournament.game.banner_url + ')'
          }
        : {};

    const team_1_players =
      match && match.team_1_players ? match.team_1_players.split('|') : [];
    const team_2_players =
      match && match.team_2_players ? match.team_2_players.split('|') : [];
    let game_settings = tournament.game_settings
      ? JSON.parse(tournament.game_settings)
      : {};
    if (!game_settings) {
      game_settings = {};
    }
    const game_settings_keys = Object.keys(game_settings);
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
                          game_user_ids.tag_icons[tournament.ladder.gamer_tag] +
                          ' pf_icon_big '
                        }
                      />
                    </div>
                    <div className="col-8 col-md-3">
                      <div className="match_heading">
                        <h4>Match</h4>
                      </div>
                      <div className="twovstwo">
                        {tournament.max_players} VS {tournament.max_players}{' '}
                        MATCH
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
                        ) : (
                          <span className="text-grey">Pending Team</span>
                        )}
                      </span>
                      <span className="game_station">
                        {tournament.game.title} @ {tournament.ladder.title}
                      </span>
                      <div className="match_start_date">
                        {moment().isAfter(moment(match.starts_at))
                          ? 'Match Started:'
                          : 'Match Starts'}{' '}
                        {moment(match.starts_at).format('lll')} ({' '}
                        {moment(match.starts_at).fromNow()} )
                      </div>
                    </div>
                  </div>
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4 col-4">
                        <span> MATCH ID</span>
                        <p>#{match.id}</p>
                      </div>

                      <div className="col-md-4 col-4">
                        <span> STATUS</span>
                        <p className={'m_status status_' + match.status}>
                          {moment().isAfter(moment(match.starts_at))
                            ? this.dynamicStatus()
                            : match.status}
                        </p>
                      </div>

                      <div className="col-md-4 col-4">
                        <span>TOURNAMENT</span>
                        <p>
                          <Link to={'/t/' + tournament.id}>
                            {tournament.title}
                          </Link>
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
                    {this.renderTicketCreate()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part single_match_details tour-single-content">
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

                  <h6 className="prizes_desclaimer">
                    <Link to={'/teams/view/' + match.team_1_id}>
                      {match.team_1_info.title}
                    </Link>{' '}
                    <span className="text-primary">{match.team_1_result}</span>{' '}
                    {match.status == 'complete' && match.result == 'team_1' ? (
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
                          <th style={{width: '33%'}}>Username</th>
                          <th
                            style={{width: '33%'}}
                            className={
                              'act_pr' + match.tournament.ladder.gamer_tag
                            }
                          >
                            {this.showGamerTag()}
                          </th>
                          <th style={{width: '33%'}}>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {match.team_1_info.team_users.map((team_user, i) => {
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
                                {team_user.user_info.prime && (
                                  <img
                                    src={
                                      '/assets/icons/ocg_member_' +
                                      team_user.user_info.prime_type +
                                      '.png'
                                    }
                                    className="inline-star float-right"
                                  />
                                )}
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
                                    match.tournament.ladder.gamer_tag
                                ] ? (
                                  team_user.user_info[
                                    'gamer_tag_' +
                                      match.tournament.ladder.gamer_tag
                                  ]
                                ) : (
                                  <span className="text-danger">No UserId</span>
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
                        })}
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
                              <th style={{width: '33%'}}>Username</th>
                              <th
                                style={{width: '33%'}}
                                className={
                                  'act_pr' + match.tournament.ladder.gamer_tag
                                }
                              >
                                {this.showGamerTag()}
                              </th>
                              <th style={{width: '33%'}}>Role</th>
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
                                    <td>
                                      {team_user.user_info.prime && (
                                        <img
                                          src={
                                            '/assets/icons/ocg_member_' +
                                            team_user.user_info.prime_type +
                                            '.png'
                                          }
                                          className="inline-star float-right"
                                        />
                                      )}
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
                                          match.tournament.ladder.gamer_tag
                                      ] ? (
                                        team_user.user_info[
                                          'gamer_tag_' +
                                            match.tournament.ladder.gamer_tag
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
                </div>
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
export default connect(mapStateToProps)(TMatchInfo);
