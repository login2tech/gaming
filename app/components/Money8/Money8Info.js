import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
import {join_match, saveScores} from '../../actions/match8';

import Messages from '../Modules/Messages';

class Money8Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      match: {
        game: {},
        ladder: {}
      },
      ladder: '',
      games: [],
      my_score: '',
      their_score: '',
      approve_join: false
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  agreeToTermsForMatchJoin(event) {
    event.preventDefault();

    this.props.dispatch(
      join_match(
        {
          // user_id: this.state.team_selected.id,
          match_id: this.state.match.id
        },
        this.props.user
      )
    );
  }

  amIEligible(team_u, ladder) {
    const gamer_tag = ladder.gamer_tag;
    if (!team_u['gamer_tag_' + gamer_tag]) {
      return false;
    }
    if (this.state.match_type == '') {
      return 'waiting';
    }

    const amount = parseFloat(this.state.match_fee);

    if (this.state.match_type == 'free') {
      return true;
    }

    if (this.state.match_type != 'free' && !this.state.match_fee) {
      return 'waiting';
    }

    if (this.state.match_type == 'cash') {
      if (parseFloat(team_u.cash_balance) < amount) {
        return false;
      }
    }

    if (this.state.match_type == 'credits') {
      if (parseFloat(team_u.credit_balance) < amount) {
        return false;
      }
    }

    return true;
  }

  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    'Epic Games Username',
    'Steam Username',
    'Battletag'
  ];

  componentDidMount() {
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

  matchLink(orign) {
    if (this.props.user) {
      return orign;
    }
    return '/login';
  }

  saveScore() {
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
    // fetch(
    //   '/api/teams/team_of_user/?uid=' +
    //     this.props.user.id +
    //     '&filter_ladder=' +
    //     this.state.match.ladder_id
    // )
    //   .then(res => res.json())
    //   .then(json => {
    //     if (json.ok) {
    this.setState({
      // is_loaded: true,
      // eligible_teams: json.teams,
      approve_join: true
    });
    //         () => {
    //           // scroll
    //           const element = document.getElementById('tlst');
    //           if (element) {
    //             element.scrollIntoView({
    //               behavior: 'smooth',
    //               block: 'end',
    //               inline: 'nearest'
    //             });
    //           }
    //         }
    //       );
    //     }
    //   });
  }

  renderJoin() {
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
      // console.log(users);
      // console.log(users[i].id, me);
      if (users[i].id == me) {
        return false;
      }
    }
    return (
      <button
        type="button"
        onClick={() => {
          this.showMatch();
        }}
        className="btn btn-default bttn_submit mw_200"
      >
        Join this Money 8 Pool
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
        result = 'Team 1 Wins';
      } else {
        result = 'Team 2 Wins';
      }
    }

    return 'Complete - ' + result;
  }

  renderScoreSubmit() {
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
        <p className="text-success">
          You have updated score as {this.state.match.team_1_result}
        </p>
      );
    }

    if (
      me == this.state.match.team_2_info.team_creator &&
      this.state.match.team_2_result
    ) {
      return (
        <p className="text-success">
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
                  {/* <span className="vs_match">
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
                      false
                    )}
                  </span> */}
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
                    joined the money 8 pool
                  </div>
                  <div className="twovstwo">
                    {this.state.match.players_total / 2} VS{' '}
                    {this.state.match.players_total / 2} MATCH
                  </div>

                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MATCH ID</span>
                        <p>#{this.state.match.id}</p>
                      </div>

                      <div className="col-md-4">
                        <span> STATUS</span>
                        <p>{this.state.match.status}</p>
                      </div>

                      <div className="col-md-4">
                        <span>TYPE</span>
                        <p>
                          {this.state.match.match_type == 'free' ? (
                            'FREE'
                          ) : (
                            <span>
                              {'PAID (' + this.state.match.match_type + ')'}
                            </span>
                          )}
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
                {/* {this.renderScoreSubmit()} */}

                {this.state.match.players_joined <
                this.state.match.players_total ? (
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-users" aria-hidden="true" /> PLAYERS
                    </h5>
                    <br />

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Gamer Tag</th>
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
                                      No Gamertag
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  false
                )}

                <br />
                {this.renderJoin()}
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
