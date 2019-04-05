import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
import {join_tournament} from '../../actions/tournament';
// import {Bracket} from 'react-tournament-bracket';

// import Messages from '../Modules/Messages';

class TournamentInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      renderTab: 'overview',
      tournament: {
        game: {},
        ladder: {},
        team_ids: '',

        teams: []
      },
      ladder: '',
      eligible_teams: [],
      games: []
      // my_score: '',
      // their_score: ''
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  agreeToTermsForMatchJoin(event) {
    event.preventDefault();

    this.props.dispatch(
      join_tournament(
        {
          team_id: this.state.team_selected.id,
          tournament_id: this.state.tournament.id
        },
        this.props.user
      )
    );

    // diptach
  }

  isEligible() {
    // if (this.state.tournament.match_type == '' || this.state.tournament.starts_at == '') {
    //   return false;
    // }
    // if (this.state.tournament_type == 'free') {
    //   return true;
    // }
    if (parseFloat(this.state.tournament.entry_fee) <= 0) {
      return false;
    }

    const amount = parseFloat(this.state.tournament.entry_fee);
    for (let i = 0; i < this.state.team_selected.team_users.length; i++) {
      if (
        parseFloat(
          this.state.team_selected.team_users[i].user_info.credit_balance
        ) < amount
      ) {
        return false;
      }
    }
    return true;
  }

  amIEligible(team_u) {
    const amount = parseFloat(this.state.tournament.entry_fee);

    if (parseFloat(team_u.user_info.credit_balance) < amount) {
      return <span className="text-danger">Not Eligible</span>;
    }
    return <span className="text-success">Eligible</span>;
  }

  componentDidMount() {
    fetch('/api/tournaments/single/' + this.props.params.tournament_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              tournament: json.item
            },
            () => {
              this.fetchTeams();
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
    //   // const scrore = '';
    //   const val = {};
    //   const me = this.props.user.id;
    //
    //   if (
    //     me == this.state.tournament.team_1_info.team_creator &&
    //     !this.state.tournament.team_1_result
    //   ) {
    //     val.team_1_result =
    //       '' + this.state.my_score + '-' + this.state.their_score;
    //   }
    //
    //   if (
    //     me == this.state.tournament.team_2_info.team_creator &&
    //     !this.state.tournament.team_2_result
    //   ) {
    //     val.team_2_result =
    //       '' + this.state.their_score + '-' + this.state.my_score;
    //   }
    //   val.id = this.state.tournament.id;
    //   // console.log(val);
    //   this.props.dispatch(saveScores(val, this.props.user));
  }

  showMatch() {
    // fetch(
    //   '/api/teams/team_of_user/?uid=' +
    //     this.props.user.id +
    //     '&filter_ladder=' +
    //     this.state.tournament.ladder_id
    // )
    //   .then(res => res.json())
    //   .then(json => {
    //     if (json.ok) {
    this.setState(
      {
        // is_loaded: true,
        // eligible_teams: json.teams,
        eligible_teams_loaded: true,
        renderTab: 'join'
      },
      () => {
        // scroll
        const element = document.getElementById('tlst');
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }
    );
    //   }
    // });
  }

  fetchTeams() {
    fetch(
      '/api/teams/team_of_user/?uid=' +
        this.props.user.id +
        '&filter_ladder=' +
        this.state.tournament.ladder_id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            eligible_teams: json.teams
          });
        }
      });
  }

  renderJoin() {
    if (
      this.state.tournament.teams_registered ==
      this.state.tournament.total_teams
    ) {
      return false;
    }

    let team_ids = this.state.tournament.team_ids;
    team_ids = team_ids.split(',');
    for (let i = 0; i < this.state.eligible_teams.length; i++) {
      if (
        team_ids.indexOf(this.state.eligible_teams[i].team_info.team_id) > -1
      ) {
        return true;
      }
    }

    return (
      <button
        type="button"
        onClick={() => {
          this.showMatch();
        }}
        className="btn btn-default bttn_submit"
      >
        Join Tournament
      </button>
    );
  }

  dynamicStatus() {
    // if (!this.state.tournament.team_2_id) {
    //   return 'Expired';
    // }
    // if (!this.state.tournament.team_1_result && !this.state.tournament.team_2_result) {
    //   return 'Pending Results';
    // }
    // if (!this.state.tournament.team_1_result || !this.state.tournament.team_2_result) {
    //   return 'Pending Results Confirmation';
    // }
    // if (this.state.tournament.team_1_result != this.state.tournament.team_2_result) {
    //   return 'Disputed';
    // }

    // let result;
    //
    // if (this.state.tournament.result == 'tie') {
    //   result = 'Tie';
    // } else {
    //   if (this.state.tournament.result == 'team_1') {
    //     result = 'Team 1 Wins';
    //   } else {
    //     result = 'Team 2 Wins';
    //   }
    // }

    // return 'Complete - ' + result;

    return 'TO BE IMPLEMENTED';
  }

  // renderScoreSubmit() {
  //   if (!this.state.tournament.team_1_id || !this.state.tournament.team_2_id) {
  //     return false;
  //   }
  //   if (!moment().isAfter(moment(this.state.tournament.starts_at))) {
  //     return false;
  //   }
  //   const me = this.props.user.id;
  //   if (
  //     me != this.state.tournament.team_1_info.team_creator &&
  //     this.state.tournament.team_2_info.team_creator != me
  //   ) {
  //     return false;
  //   }
  //
  //   if (
  //     me == this.state.tournament.team_1_info.team_creator &&
  //     this.state.tournament.team_1_result
  //   ) {
  //     return (
  //       <p className="text-success">
  //         You have updated score as {this.state.tournament.team_1_result}
  //       </p>
  //     );
  //   }
  //
  //   if (
  //     me == this.state.tournament.team_2_info.team_creator &&
  //     this.state.tournament.team_2_result
  //   ) {
  //     return (
  //       <p className="text-success">
  //         You have updated score as {this.state.tournament.team_2_result}
  //       </p>
  //     );
  //   }
  //
  //   // i have submitted?
  //
  //   //
  //   // my_score
  //   // their_score
  //
  //   return (
  //     <div>
  //       <h5 className="prizes_desclaimer">Report Scrore</h5>
  //
  //       <div className="well well-sm well-dark margin-20">
  //         <form
  //           className="light-form"
  //           onSubmit={event => {
  //             event.preventDefault();
  //             this.saveScore();
  //           }}
  //         >
  //           <Messages messages={this.props.messages} />
  //           <div className="row">
  //             <div className="col-md-6">
  //               <div className="form-group">
  //                 <label htmlFor="my_score">My Team Score</label>
  //                 <p>How many rounds did your team win?</p>
  //                 <input
  //                   className="form-control "
  //                   type="text"
  //                   name="my_score"
  //                   id="my_score"
  //                   value={this.state.my_score}
  //                   required
  //                   placeholder="Your Team Score"
  //                   onChange={this.handleChange.bind(this)}
  //                 />
  //               </div>
  //             </div>
  //             <div className="col-md-6">
  //               <div className="form-group">
  //                 <label htmlFor="their_score">Opponent Team Score</label>
  //                 <p>How many rounds did the oppenent team win?</p>
  //                 <input
  //                   className="form-control "
  //                   type="text"
  //                   name="their_score"
  //                   id="their_score"
  //                   value={this.state.their_score}
  //                   required
  //                   placeholder="Opponent Team Score"
  //                   onChange={this.handleChange.bind(this)}
  //                 />
  //               </div>
  //             </div>
  //           </div>
  //           <div className="row">
  //             <div className="col-md-12">
  //               <button
  //                 type="submit"
  //                 className="btn  btn-primary margin-5 max-width-300"
  //                 disabled={
  //                   this.state.my_score == '' || this.state.their_score == ''
  //                 }
  //               >
  //                 Report Match Score
  //               </button>
  //             </div>
  //           </div>
  //         </form>
  //       </div>
  //       <br />
  //       <br />
  //     </div>
  //   );
  // }

  renderOverview() {
    return (
      <div className="col-md-12">
        {/* <div className="row">
          <div className="col-sm-8">
            <table className="t-page-title-table">
              <tbody>
                <tr>
                  <td>
                    <span className="t-page-title">
                      <i className="icon-tournament" />
                    </span>
                  </td>
                  <td>
                    <span className="t-page-title">
                      {this.state.tournament.ladder.title}
                    </span>
                    <span className="t-hosted-by">
                      Tournament hosted by OCGaming
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-sm-4">
            <div className="tourn-flags" />
          </div>
        </div> */}
        <div className="row">
          <div className="col-sm-4 col-6">
            <div className="t-prizes">
              <div className="t-prizes-place p1">
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <span className="hc-trophy-icon">
                          <img
                            src="https://umggaming.com/img/goldtrophy.png"
                            style={{width: '40px'}}
                          />
                        </span>
                      </td>
                      <td>
                        1<sup>st</sup> Place
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="t-prizes-amount">
                ${this.state.tournament.first_winner_price}
                {/* <span>$87.00 Per Player</span> */}
              </div>
            </div>
          </div>
          <div className="col-sm-4 col-6">
            <div className="t-prizes">
              <div className="t-prizes-place p2">
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <span className="hc-trophy-icon">
                          <img
                            src="https://umggaming.com/img/silvertrophy.png"
                            style={{width: '40px'}}
                          />
                        </span>
                      </td>
                      <td>
                        2<sup>nd</sup> Place
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="t-prizes-amount">
                ${this.state.tournament.second_winner_price}
                {/* <span>$37.00 Per Player</span> */}
              </div>
            </div>
          </div>
          <div className="col-sm-4 col-6">
            <div className="t-prizes">
              <div className="t-prizes-place p3">
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <span className="hc-trophy-icon">
                          <img
                            src="https://umggaming.com/img/bronzetrophy.png"
                            style={{width: '40px'}}
                          />
                        </span>
                      </td>
                      <td>
                        3<sup>rd</sup> Place
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="t-prizes-amount">
                {this.state.tournament.third_winner_price}
                {/* <span>$0.00 Per Player</span> */}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Game</div>
              <div
                className="tourn-info-box tourn-info-game"
                style={{borderColor: '#b226cc'}}
              >
                {this.state.tournament.game.title}
              </div>
            </div>
          </div>

          {/* <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Platforms</div>
              <div className="tourn-info-box">PS4</div>
            </div>
          </div>

          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Regions</div>
              <div className="tourn-info-box">North America, Europe</div>
            </div>
          </div>
         */}

          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Entry fee</div>
              <div className="tourn-info-box">
                <span className="umg-credit">
                  {this.state.tournament.entry_fee}
                </span>{' '}
                Credits
              </div>
            </div>
          </div>

          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Prize Pool</div>
              <div className="tourn-info-box">
                $
                {this.state.tournament.second_winner_price +
                  this.state.tournament.third_winner_price +
                  this.state.tournament.first_winner_price}
              </div>
            </div>
          </div>

          {/* <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Team Size</div>
              <div className="tourn-info-box">1v1</div>
            </div>
          </div> */}
        </div>

        <div className="row">
          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">EVENT START</div>
              <div className="tourn-info-box">
                {moment(this.state.tournament.starts_at).format('lll')}
              </div>
            </div>
          </div>

          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">REGISTRATION OPENS</div>
              <div className="tourn-info-box">
                {moment(this.state.tournament.registration_start_at).format(
                  'lll'
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">REGISTRATION ENDS</div>
              <div className="tourn-info-box">
                {moment(this.state.tournament.registration_end_at).format(
                  'lll'
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">bracket size</div>
              <div className="tourn-info-box">
                {this.state.tournament.total_teams} Teams
              </div>
            </div>
          </div>

          {/* <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">bracket type</div>
              <div className="tourn-info-box">Single Elimination</div>
            </div>
          </div> */}

          <div className="col-sm-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">teams registered</div>
              <div className="tourn-info-box">
                {this.state.tournament.teams_registered
                  ? this.state.tournament.teams_registered
                  : '0'}
              </div>
            </div>
          </div>
        </div>

        <div id="cdm-zone-01" className="cdm-zone-long" />
      </div>
    );
  }
  renderBrackets() {
    return (
      <div className="col-md-12">
        <div className="alert alert-warning">
          Brackets are yet not generated
        </div>
      </div>
    );
  }

  renderTeams() {
    const {teams} = this.state.tournament;
    return (
      <div className="col-md-12">
        {teams.map((team, i) => {
          return (
            <div key={team.id}>
              <h6 className="prizes_desclaimer">{team.title}</h6>
              <table className="table table-striped table-ongray table-hover">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {team.team_users.map((team_user, i) => {
                    console.log(team_user);
                    return (
                      <tr key={team_user.id}>
                        <td>
                          <Link to={'/u/' + team_user.user_info.username}>
                            {team_user.user_info.username}
                          </Link>
                        </td>

                        <td>
                          {team_user.user_id == team.team_creator
                            ? 'Leader'
                            : 'Member'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  }

  renderRules() {
    return (
      <div className="col-md-12">
        <div>
          {this.state.tournament && this.state.tournament.ladder ? (
            <div
              dangerouslySetInnerHTML={{
                __html: this.state.tournament.ladder.rules
              }}
            />
          ) : (
            false
          )}
        </div>
      </div>
    );
  }

  renderJoinPage() {
    return (
      <div className="col-md-12">
        {this.state.team_selected ? (
          <div>
            <button
              className="  btn btn-primary btn-sm max-width-300"
              onClick={() => {
                this.setState({
                  team_selected: false
                });
              }}
            >
              <i className="fa fa-arrow-left" /> back to team list
            </button>
            <br />
            <form
              onSubmit={event => {
                this.agreeToTermsForMatchJoin(event);
              }}
            >
              <h6 className="prizes_desclaimer">
                {this.state.team_selected.title} - Rooster
              </h6>
              <table className="table table-striped table-ongray table-hover">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Eligibility</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.team_selected.team_users.map((team_user, i) => {
                    return (
                      <tr key={team_user.id}>
                        <td>
                          <Link to={'/u/' + team_user.user_info.username}>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <br />
              <label>
                <input type="checkbox" required /> I agree to the terms to join
                this match.
              </label>
              <br />
              <br />
              <input
                type="submit"
                disabled={!this.isEligible.bind(this)}
                className="btn btn-primary max-width-300"
                value={'Join Match'}
              />
            </form>
          </div>
        ) : (
          false
        )}

        <ul className="team_list" id="tlst">
          {this.state.eligible_teams_loaded &&
            !this.state.team_selected &&
            this.state.eligible_teams.map((team_parent, i) => {
              if (
                team_parent.team_info.ladder_id !=
                this.state.tournament.ladder_id
              ) {
                return false;
              }
              const team = team_parent.team_info ? team_parent.team_info : {};
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
          {this.state.eligible_teams_loaded &&
            !this.state.team_selected && (
              <li>
                <a
                  target="_blank"
                  href={'/u/' + this.props.user.username + '/teams/new'}
                >
                  <img src="/images/team_new.png" />
                </a>
              </li>
            )}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <div className="match_heading">
                    <h4>{this.state.tournament.title}</h4>
                  </div>

                  <span className="game_station">
                    {this.state.tournament.game.title} @{' '}
                    {this.state.tournament.ladder.title}
                  </span>
                  <div className="match_start_date">
                    {moment().isAfter(moment(this.state.tournament.starts_at))
                      ? 'Match Started:'
                      : 'Match Starts'}{' '}
                    {moment(this.state.tournament.starts_at).fromNow()}
                  </div>
                  {/* <div className="twovstwo">1 VS 1 MATCH</div> */}
                  {/* // <div className="match_end_date">// // </div> */}
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
                        <span> TOURNAMENT ID</span>
                        <p>#{this.state.tournament.id}</p>
                      </div>

                      <div className="col-md-4">
                        <span> STATUS</span>
                        <p>
                          {moment().isAfter(
                            moment(this.state.tournament.starts_at)
                          )
                            ? this.dynamicStatus()
                            : this.state.tournament.status}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <span>Registered</span>
                        <p>
                          {this.state.tournament.teams_registered
                            ? this.state.tournament.teams_registered
                            : 0}
                          {' / ' + this.state.tournament.total_teams}
                        </p>
                      </div>
                    </div>
                    {this.renderJoin()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="baris">
            <div className="container">
              <ul className="lnkss">
                <li
                  className={this.state.renderTab == 'overview' ? 'active' : ''}
                >
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'overview'
                      });
                    }}
                  >
                    Overview
                  </Link>
                </li>

                <li
                  className={this.state.renderTab == 'brackets' ? 'active' : ''}
                >
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'brackets'
                      });
                    }}
                  >
                    Brackets
                  </Link>
                </li>

                <li className={this.state.renderTab == 'teams' ? 'active' : ''}>
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'teams'
                      });
                    }}
                  >
                    Teams
                  </Link>
                </li>

                <li className={this.state.renderTab == 'rules' ? 'active' : ''}>
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'rules'
                      });
                    }}
                  >
                    Rules
                  </Link>
                </li>

                {this.state.renderTab == 'join' ? (
                  <li
                    className={this.state.renderTab == 'join' ? 'active' : ''}
                  >
                    <Link
                      onClick={() => {
                        this.setState({
                          renderTab: 'join'
                        });
                      }}
                    >
                      Join
                    </Link>
                  </li>
                ) : (
                  false
                )}
              </ul>
            </div>
          </div>
        </section>
        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              {this.state.renderTab == 'overview'
                ? this.renderOverview()
                : false}
              {this.state.renderTab == 'brackets'
                ? this.renderBrackets()
                : false}
              {this.state.renderTab == 'teams' ? this.renderTeams() : false}
              {this.state.renderTab == 'rules' ? this.renderRules() : false}
              {this.state.renderTab == 'join' ? this.renderJoinPage() : false}
            </div>
          </div>
        </section>
        {/* {this.renderScoreSubmit()} */}
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
export default connect(mapStateToProps)(TournamentInfo);
