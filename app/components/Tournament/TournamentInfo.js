import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import GameRules from '../Modules/GameRules';
const moment = require('moment');
import {join_tournament, saveScores} from '../../actions/tournament';
import game_user_ids from '../../../config/game_user_ids';
import Messages from '../Modules/Messages';
import utils from '../../utils';

class TournamentInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      zoom: 1,
      renderTab: 'overview',
      tournament: {
        second_winner_price: 0,
        first_winner_price: 0,
        third_winner_price: 0,
        game: {},
        ladder: {},
        matches: [],
        team_ids: '',
        teams: []
      },
      users_data: {},
      ladder: '',
      using_users: [],
      eligible_teams: [],
      games: []
      // my_score: '',
      // their_score: ''
    };
  }

  get_team_name(id) {
    if (!id || ('' + id).indexOf('BYE_') > -1) {
      return 'BYE';
    }

    const {tournament} = this.state;
    const teams = tournament.teams;
    if (!teams) {
      return '';
    }

    for (let i = teams.length - 1; i >= 0; i--) {
      if (teams[i].id == id) {
        return teams[i].title;
      }
    }
  }

  getM(round, t1, t2) {
    if (('' + t1).indexOf('BYE_') > -1) {
      t1 = null;
    } else {
      t1 = parseInt(t1);
    }
    if (('' + t2).indexOf('BYE_') > -1) {
      t2 = null;
    } else {
      t2 = parseInt(t2);
    }
    // this.state.tournament.matches.map(function(item){
    //   console.log( item.team_1_id, item.team_2_id, item.match_round, t1, t2 );
    // })
    return this.state.tournament.matches.filter(function(item) {
      return item.match_round == round &&
        ((item.team_1_id == t1 && item.team_2_id == t2) ||
          (item.team_2_id == t1 && item.team_1_id == t2))
        ? true
        : false;
    });
  }

  getMatchWinner(round, t1, t2, tc) {
    tc = parseInt(tc);
    const items = this.getM(round, t1, t2);
    if (items && items.length) {
      // console.log(items[0].result, items[0].team_1_id, tc);

      const current_team = items[0].team_1_id == tc ? 'team_1' : 'team_2';

      if (items[0].result == current_team) {
        return true;
      }
      return false;
      // if (items[0].result == 'team_1' && items[0].team_1_id == tc) {
      //   return true;
      // }
      // if (items[0].result == 'team_2' && items[0].team_2_id == tc) {
      //   return true;
      // }
    }
    return false;
  }

  getMatchLooser(round, t1, t2, tc) {
    const items = this.getM(round, t1, t2);
    if (items && items.length) {
      const current_team = items[0].team_1_id == tc ? 'team_2' : 'team_1';

      if (items[0].result == current_team) {
        return true;
      }
      return false;
    }
    return false;
  }

  getMatchName(round, t1, t2, cnt) {
    const items = this.getM(round, t1, t2);
    if (items && items.length) {
      return (
        '<a href="/tournament-match/' +
        items[0].id +
        '">View Match Details' +
        '</a>'
      );
    }
    return '';
  }

  cnt = 1;
  rounc(a) {
    a = parseInt(a);
    if (a == 4) {
      return 2;
    } else if (a == 8) {
      return 3;
    } else if (a == 16) {
      return 4;
    } else if (a == 32) {
      return 5;
    } else if (a == 64) {
      return 6;
    }
  }
  createBrackets() {
    this.cnt = 0;
    let brackets = this.state.tournament.brackets;

    if (!brackets) {
      brackets = {
        rounds_calculated: 0,
        total_rounds: this.rounc(this.state.tournament.total_teams)
      };
      brackets = JSON.stringify(brackets);

      // return;
    }
    let teams = this.state.tournament.team_ids;
    if (!teams) {
      teams = '';
    }
    teams = teams.split(',');
    brackets = JSON.parse(brackets);
    const rounds_c = brackets.rounds_calculated;

    const rounds = [];
    const round_titles = [];
    if (rounds_c > 0) {
      for (let i = 0; i < rounds_c; i++) {
        const round_data = brackets['round_' + (i + 1)];
        // console.log(round_data);
        // if()
        const final_round_data = [];
        for (let j = 0; j < round_data.length; j++) {
          let team_1 = round_data[j][0];
          team_1 = teams[team_1 - 1];

          let team_2 = round_data[j][1];
          team_2 = teams[team_2 - 1];
          // console.log(team_1, team_2);
          const team_1_name = this.get_team_name(team_1);
          const team_2_name = this.get_team_name(team_2);
          this.cnt++;
          final_round_data.push({
            match_title: this.getMatchName(i + 1, team_1, team_2, this.cnt),
            player1: {
              name: team_1_name,
              ID: team_1,
              url: '/teams/view/' + team_1,
              winner: this.getMatchWinner(i + 1, team_1, team_2, team_1),
              looser: this.getMatchLooser(i + 1, team_1, team_2, team_1)
            },
            player2: {
              name: team_2_name,
              ID: team_2,
              url: team_2_name == 'BYE' ? '#' : '/teams/view/' + team_2,
              winner: this.getMatchWinner(i + 1, team_1, team_2, team_2),
              looser: this.getMatchLooser(i + 1, team_1, team_2, team_2)
            }
          });
        }
        if (final_round_data.length) {
          rounds.push(final_round_data);
          round_titles.push('Round ' + (i + 1));
        }
      }
    }

    // console.log(rounds_c,brackets.total_rounds)
    if (rounds_c < brackets.total_rounds) {
      for (let k = rounds_c; k < brackets.total_rounds; k++) {
        const final_round_data = [];

        let add;
        if (k == 0) {
          add = this.state.tournament.total_teams;
        } else {
          add = rounds[k - 1].length;
        }

        add = add / 2;
        console.log('this round: ', k, 'has ', add, 'matches');
        for (let m = 0; m < add; m++) {
          final_round_data.push({
            empty: true,
            match_title: ' ',
            player1: {name: '', empty: true, ID: '', url: '', winner: ''},
            player2: {name: '', empty: true, ID: '', url: '', winner: ''}
          });
        }

        rounds.push(final_round_data);
        // final_round_data.p
      }
    }
    // console.log(brackets.winner);
    if (brackets.winner) {
      // team_1 = teams[team_1 - 1];
      // console.log(teams, brackets.winner);
      rounds.push([
        {
          class: 'winner_round',
          is_winner: true,
          match_title: 'Winner',
          player1: {
            name: this.get_team_name(brackets.winner),
            ID: '' + brackets.winner,
            url: '/teams/view/' + brackets.winner,
            winner: true
          }
        }
      ]);
      round_titles.push(' ');
    } else {
      rounds.push([
        {
          empty: true,
          class: 'winner_round',
          is_winner: true,
          match_title: ' ',
          player1: {name: ' WINNER', empty: true, ID: '', url: '', winner: ''}
        }
      ]);
      round_titles.push('Winner');
    }
    // debugger;
    // console.log(rounds);
    if (!$('.brackets').brackets) {
      setTimeout(function() {
        $('.brackets').brackets({
          // titles: round_titles,
          rounds: rounds,
          color_title: 'white',
          titles: true,
          border_color: 'rgb(41, 71, 244)',
          color_player: 'white',
          bg_player: 'rgb(41, 71, 244)',
          color_player_hover: 'white',
          bg_player_hover: 'rgb(0,0,0)',
          border_radius_player: '4px',
          border_radius_lines: '4px'
        });
      }, 5000);
      return;
    }

    $('.brackets').brackets({
      // titles: round_titles,
      rounds: rounds,
      color_title: 'white',
      titles: true,
      border_color: 'rgb(41, 71, 244)',
      color_player: 'white',
      bg_player: 'rgb(41, 71, 244)',
      color_player_hover: 'white',
      bg_player_hover: 'rgb(0,0,0)',
      border_radius_player: '4px',
      border_radius_lines: '4px'
      // MORE OPTIONS HERE
    });
  }

  am_i_in_match(match) {
    let team_1_p = match.team_1_players;

    team_1_p = team_1_p.split('|');
    if (team_1_p.indexOf('' + this.props.user.id) > -1) {
      return match.team_1_id;
    }
    let team_2_p = match.team_2_players;

    team_2_p = team_2_p.split('|');
    if (team_2_p.indexOf('' + this.props.user.id) > -1) {
      return match.team_2_id;
    }
    return false;

    // for (let i = 0; i < this.state.eligible_teams.length; i++) {
    //   // console.log(this.state.eligible_teams[i].id);
    //   if (this.state.eligible_teams[i].team_id == team_1_id) {
    //     return this.state.eligible_teams[i].team_id;
    //   }
    //   if (this.state.eligible_teams[i].team_id == team_2_id) {
    //     return this.state.eligible_teams[i].team_id;
    //   }
    // }
    // return false;
  }

  getTeams(match) {
    const team_1_id = match.team_1_id;
    const team_2_id = match.team_2_id;
    const {tournament} = this.state;
    const user_teams = tournament.teams;
    // console.log(user_teams);

    let team_1_obj = null;
    let team_2_obj = null;
    for (let i = 0; i < user_teams.length; i++) {
      if (team_1_id == user_teams[i].id) {
        team_1_obj = user_teams[i];
      }
      if (team_2_id == user_teams[i].id) {
        team_2_obj = user_teams[i];
      }
    }
    return [team_1_obj, team_2_obj];
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
          tournament_id: this.state.tournament.id,
          using_users: this.state.using_users
        },
        this.props.user
      )
    );

    // diptach
  }

  isEligible() {
    // if (parseFloat(this.state.tournament.entry_fee) <= 0) {
    //   return false;
    // }

    if (
      parseInt(this.state.tournament.max_players) !=
      this.state.using_users.length
    ) {
      return false;
    }
    // console.log('here');

    const amount = parseFloat(this.state.tournament.entry_fee);
    for (let i = 0; i < this.state.team_selected.team_users.length; i++) {
      // console.log(
      //   this.state.using_users.indexOf(
      //     this.state.team_selected.team_users[i].user_info.id
      //   )
      // );
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
          this.state.team_selected.team_users[i].user_info.credit_balance
        ) < amount
      ) {
        // console.log('no');
        return false;
      }
    }
    return true;
  }

  amIEligibleFlag(team_u) {
    // if (this.state.match.match_type == '') {
    //   return false;
    // }
    const gamer_tag = this.state.tournament.ladder.gamer_tag;
    if (!team_u.user_info['gamer_tag_' + gamer_tag]) {
      return false;
    }

    const amount = parseFloat(this.state.tournament.entry_fee);

    if (parseFloat(team_u.user_info.credit_balance) < amount) {
      return false;
    }
    if (this.state.tournament.member_tournament && !team_u.user_info.prime) {
      return false;
    }
    return true;
  }

  amIEligible(team_u) {
    if (
      !team_u.user_info['gamer_tag_' + this.state.tournament.ladder.gamer_tag]
    ) {
      return (
        <span
          className="text-danger"
          data-toggle="tooltip"
          title="Gamer Tag not Set"
        >
          <img src="/images/controller-red.svg" className="icon_size" /> Not
          Eligible
        </span>
      );
    }

    const amount = parseFloat(this.state.tournament.entry_fee);

    if (parseFloat(team_u.user_info.credit_balance) < amount) {
      return (
        <span
          className="text-danger"
          data-toggle="tooltip"
          title="Not Enough Credit Balance"
        >
          <img src="/images/controller-red.svg" className="icon_size" /> Not
          Eligible
        </span>
      );
    }
    if (this.state.tournament.member_tournament && !team_u.user_info.prime) {
      return (
        <span
          className="text-danger"
          data-toggle="tooltip"
          title="Not a prime member"
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
    this.fetchTournament();
  }

  fetchTournament(skip) {
    fetch('/api/tournaments/single/' + this.props.params.tournament_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              tournament: json.item,
              users_data: json.users_data ? json.users_data : {}
            },
            () => {
              if (skip) {
                //
              } else {
                this.fetchTeams();
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

  submitScore(match_id, s_no) {
    const score_1 = this.state[
      'match_' + match_id + '_' + s_no + '_team_1_score'
    ];
    const score_2 = this.state[
      'match_' + match_id + '_' + s_no + '_team_2_score'
    ];

    const submitter = s_no;

    const val = {};

    if (submitter == 1) {
      val.team_1_result = '' + score_1 + '-' + score_2;
    } else if (submitter == 2) {
      val.team_2_result = '' + score_1 + '-' + score_2;
    }

    val.id = match_id;
    this.props.dispatch(
      saveScores(val, this.props.user, () => {
        this.fetchTournament(true);
      })
    );
  }

  showJoin() {
    this.setState(
      {
        eligible_teams_loaded: true,
        renderTab: 'join'
      },
      () => {
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
  }

  fetchTeams() {
    if (!this.props.user) {
      return;
    }

    fetch(
      '/api/teams/team_of_user/?filter_type=tournaments&uid=' +
        this.props.user.id +
        '&filter_tournament_id=' +
        this.props.params.tournament_id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            eligible_teams: json.teams,
            team_selected:
              json.teams && json.teams.length ? json.teams[0].team_info : false
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
    if (this.state.tournament.status != 'pending') {
      return false;
    }

    let team_ids = this.state.tournament.team_ids;
    if (!team_ids) {
      team_ids = '';
    }
    team_ids = team_ids.split(',');
    if (this.state.team_selected) {
      const id = '' + this.state.team_selected.id;
      if (team_ids.indexOf(id) > -1) {
        return false;
      }
    }
    // let selected_team_id = this.state.team_selected
    // for (let i = 0; i < this.state.eligible_teams.length; i++) {
    //   if (
    //     team_ids.indexOf(this.state.eligible_teams[i].team_info.team_id) > -1
    //   ) {
    //     return true;
    //   }
    // }

    return (
      <button
        type="button"
        onClick={() => {
          this.showJoin();
        }}
        className="btn btn-default bttn_submit mw_200"
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
    if (this.state.tournament.status == 'cancelled') {
      return (
        <span className="status_cancelled">
          Cancelled
          <br />
          {this.state.tournament.teams_registered > 0 ? (
            <small>REFUND PROCESSED</small>
          ) : (
            false
          )}
        </span>
      );
    }
    return this.state.tournament.status;
    // return 'TO BE IMPLEMENTED';
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
        {this.renderListPad('mobile')}
        {/* <div className="row">
          <div className="col-sm-8">
            <div className="table_wrapper"><table className="t-page-title-table">
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
            </table></div>
          </div>
          <div className="col-sm-4">
            <div className="tourn-flags" />
          </div>
        </div> */}
        <div className="row ">
          <div className="col-md-4 col-12">
            <div className="t-prizes">
              <div className="t-prizes-place p1 tr">
                <div className="table_wrapper">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <span className="hc-trophy-icon">
                            <img
                              src="/assets/icons/gold.png"
                              style={{width: '80px'}}
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
              </div>
              <div className="t-prizes-amount">
                <span>
                  ${this.state.tournament.first_winner_price.toFixed(2)} Per
                  Player
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="t-prizes">
              <div className="t-prizes-place p2 tr">
                <div className="table_wrapper">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <span className="hc-trophy-icon">
                            <img
                              src="/assets/icons/silver.png"
                              style={{width: '80px'}}
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
              </div>
              <div className="t-prizes-amount">
                <span>
                  ${this.state.tournament.second_winner_price.toFixed(2)} Per
                  Player
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="t-prizes">
              <div className="t-prizes-place p3 tr">
                <div className="table_wrapper">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <span className="hc-trophy-icon">
                            <img
                              src="/assets/icons/bronze.png"
                              style={{width: '80px'}}
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
              </div>
              <div className="t-prizes-amount">
                <span>
                  ${this.state.tournament.third_winner_price.toFixed(2)} Per
                  Player
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 col-12">
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

          <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Ladder</div>
              <div className="tourn-info-box tourn-info-game ico_no_fl">
                {this.state.tournament.ladder.title}{' '}
              </div>
            </div>
          </div>

          {/* <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Platforms</div>
              <div className="tourn-info-box">PS4</div>
            </div>
          </div>

          <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Regions</div>
              <div className="tourn-info-box">North America, Europe</div>
            </div>
          </div>
         */}

          <div className="col-md-4 col-12">
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

          {/* <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">Team Size</div>
              <div className="tourn-info-box">1v1</div>
            </div>
          </div> */}
        </div>

        <div className="row">
          <div className="col-md-4 col-12">
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

          <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">bracket size</div>
              <div className="tourn-info-box">
                {this.state.tournament.total_teams} Teams
              </div>
            </div>
          </div>

          {/* <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">bracket type</div>
              <div className="tourn-info-box">Single Elimination</div>
            </div>
          </div> */}

          <div className="col-md-4 col-12">
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

        <div className="row">
          <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">REGISTRATION ENDS</div>
              <div className="tourn-info-box">
                {moment(this.state.tournament.registration_end_at).format(
                  'lll'
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">EVENT START</div>
              <div className="tourn-info-box">
                {moment(this.state.tournament.starts_at).format('lll')}
              </div>
            </div>
          </div>

          <div className="col-md-4 col-12">
            <div className="tourn-info">
              <div className="tourn-info-title">REGISTRATION OPENS</div>
              <div className="tourn-info-box">
                {moment(this.state.tournament.registration_start_at).format(
                  'lll'
                )}
              </div>
            </div>
          </div>
        </div>

        <div id="cdm-zone-01" className="cdm-zone-long" />
      </div>
    );
  }

  renderBrackets() {
    const brackets = this.state.tournament.brackets;
    // if (!brackets) {
    //   return (
    //     <div className="col-md-12">
    //       <div className="alert alert-warning">
    //         Brackets are yet not generated
    //       </div>
    //     </div>
    //   );
    // }
    return (
      <div className="col-md-12">
        <div className="brackets" style={{zoom: this.state.zoom}} />
      </div>
    );
  }

  renderTeams() {
    const {tournament} = this.state;
    let team_obj = tournament.teams_obj;
    if (!team_obj) {
      team_obj = '{}';
    }
    team_obj = JSON.parse(team_obj);

    // const {teams} = this.state.tournament;
    return (
      <div className="col-md-12">
        {tournament.teams.map((team, i) => {
          const usrs_list = team_obj['team_' + team.id];
          // usrs_list =

          return (
            <div key={team.id}>
              <h6 className="prizes_desclaimer">
                <Link to={'/teams/view/' + team.id}>{team.title}</Link>
              </h6>
              <div className="table_wrapper">
                <table className="table table-striped table-ongray table-hover">
                  <thead>
                    <tr>
                      <th style={{width: '50%'}}>Username</th>
                      <th style={{width: '50%'}}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usrs_list.map((usr, i) => {
                      const team_user =
                        this.state.users_data &&
                        this.state.users_data['usr_' + usr]
                          ? this.state.users_data['usr_' + usr]
                          : {};
                      return (
                        <tr key={team_user.id}>
                          <td>
                            <Link to={'/u/' + team_user.username}>
                              {team_user.username}
                            </Link>
                          </td>

                          <td>
                            {team_user.id == team.team_creator
                              ? 'Leader'
                              : 'Member'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  dynamicStatus_match(match) {
    if (match.status == 'complete') {
      return 'Complete';
    }
    if (!match.team_2_id) {
      return 'Expired';
    }
    if (match.status == 'disputed') {
      return 'Disputed';
    }
    if (!match.team_1_result && !match.team_2_result) {
      return 'Pending Results';
    }
    if (!match.team_1_result || !match.team_2_result) {
      return 'Pending Results Confirmation';
    }

    let result = '';

    if (match.result == 'tie') {
      result = ' - Tie';
    } else {
      if (match.result == 'team_1') {
        // result = match.team_1_info.title + ' Wins';
      } else {
        // result = match.team_2_info.title + ' Wins';
      }
    }

    return 'Complete' + result;
  }

  renderMatchLine(match, i, round) {
    if (match.match_round != round) {
      return false;
    }
    const teams = this.getTeams(match);

    return (
      <React.Fragment key={match.id}>
        <tr key={match.id}>
          <td>
            {teams[0] ? (
              <Link to={'/teams/view/' + teams[0].id}>{teams[0].title}</Link>
            ) : (
              <span className="text-primary">BYE</span>
            )}{' '}
            {match.result == 'team_1' ? (
              <span className="text-success">W</span>
            ) : match.result == 'team_2' ? (
              <span className="text-danger">L</span>
            ) : (
              ''
            )}
          </td>
          <td>
            {teams[1] ? (
              <Link to={'/teams/view/' + teams[1].id}>{teams[1].title}</Link>
            ) : (
              <span className="text-primary">BYE</span>
            )}{' '}
            {match.result == 'team_2' ? (
              <span className="text-success">W</span>
            ) : match.result == 'team_1' ? (
              <span className="text-danger">L</span>
            ) : (
              ''
            )}
          </td>

          <td className="d-md-table-cell d-none">
            {moment(match.starts_at).format('lll')}{' '}
          </td>
          <td className="d-md-table-cell d-none">
            {moment().isAfter(moment(match.starts_at))
              ? this.dynamicStatus_match(match)
              : match.status}
          </td>
          <td>
            <Link to={'/tournament-match/' + match.id}>
              View <span className="h-o-p">Match</span>
            </Link>
          </td>
          <td className="d-md-none">
            <button
              className="btn btn-link"
              onClick={() => {
                this.setState({
                  expanded:
                    match.id == this.state.expand_id
                      ? !this.state.expanded
                      : true,
                  expand_id: match.id
                });
              }}
            >
              <span
                className={
                  this.state.expanded && this.state.expand_id == match.id
                    ? ' fa fa-minus'
                    : ' fa fa-plus '
                }
              />
            </button>
          </td>
        </tr>
        {this.state.expanded && this.state.expand_id == match.id ? (
          <tr key={'e_' + match.id}>
            <td colSpan={4}>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Date</td>
                    <td>{moment(match.starts_at).format('lll')} </td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>
                      {moment().isAfter(moment(match.starts_at))
                        ? this.dynamicStatus_match(match)
                        : match.status}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        ) : (
          false
        )}
      </React.Fragment>
    );
  }

  renderMatch() {
    let rounds = this.state.tournament.brackets;
    if (!rounds) {
      rounds = '[]';
    }
    rounds = JSON.parse(rounds);
    rounds = rounds.rounds_calculated;
    const rnds = [];
    for (let i = 0; i < rounds; i++) {
      rnds.push(i + 1);
    }
    return rnds.map((round, i) => {
      const getMatchCount = this.state.tournament.matches.filter(function(
        mitm
      ) {
        return mitm.match_round == round ? true : false;
      }).length;
      if (getMatchCount < 1) {
        return false;
      }
      return (
        <div className="col-md-12" key={round}>
          <h6 className="prizes_desclaimer">Round {round}</h6>
          <div>
            <div className="table_wrapper">
              <table className="table table-striped table-ongray table-hover">
                <thead>
                  <tr>
                    <th style={{width: '23%'}}>Team</th>
                    <th style={{width: '23%'}}>Opponent</th>
                    <th
                      className="d-md-table-cell d-none"
                      style={{width: '20%'}}
                    >
                      Date
                    </th>
                    <th
                      className="d-md-table-cell d-none"
                      style={{width: '24%'}}
                    >
                      Status
                    </th>
                    <th style={{width: '10%'}}>Info</th>
                    <th style={{width: '10%'}} className="d-md-none" />
                  </tr>
                </thead>
                <tbody>
                  {this.state.tournament.matches.map((match, i) => {
                    return this.renderMatchLine(match, i, round);
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    });
  }

  renderRules() {
    return (
      <div className="col-md-12">
        <div>
          <GameRules title={this.state.tournament.game.title} />
        </div>
      </div>
    );
  }

  renderJoinPage() {
    // alert();
    if (this.state.tournament.member_tournament && !this.props.user.prime) {
      return (
        <div className="alert alert-warning width-100">
          You need to be a prime member to join OCG Members Tournament.
          <a target="_blank" href={'/shop'} rel="noopener noreferrer">
            Click here to purchase Membership
          </a>
        </div>
      );
    }

    return (
      <div className="col-md-12">
        <Messages messages={this.props.messages} />
        <br />

        {this.state.team_selected ? (
          <div>
            <br />
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
                    {this.state.team_selected.team_users.map((team_user, i) => {
                      if (team_user.removed == 1) {
                        return false;
                      }
                      if (team_user.accepted == false) {
                        return false;
                      }
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
                          <td>
                            <label>
                              <input
                                disabled={!this.amIEligibleFlag(team_user)}
                                type="checkbox"
                                checked={
                                  this.state.using_users.indexOf(
                                    team_user.user_info.id
                                  ) > -1
                                }
                                onChange={() => {
                                  const using_users = this.state.using_users;
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
                                    using_users.push(team_user.user_info.id);
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
                    })}
                  </tbody>
                </table>
              </div>
              <br />
              <label>
                <input type="checkbox" required /> I agree to the terms to join
                this tournament.
              </label>
              <br />
              <br />
              <input
                type="submit"
                disabled={!this.isEligible()}
                className="btn btn-primary max-width-300"
                value={'Join Tournament'}
              />
            </form>
          </div>
        ) : (
          false
        )}

        <ul className="team_list" id="tlst">
          {/*this.state.eligible_teams_loaded &&
            !this.state.team_selected &&
            this.state.eligible_teams.map((team_parent, i) => {
              if (
                team_parent.team_info.ladder_id !=
                this.state.tournament.ladder_id
              ) {
                return false;
              }
              const team = team_parent.team_info ? team_parent.team_info : {};
              if (team.removed == true) {
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
            })*/}
        </ul>

        {this.state.eligible_teams_loaded &&
          !this.state.team_selected &&
          this.state.eligible_teams.length < 1 && (
            <div className="alert alert-warning">
              You do not have a tournament team for this tournament. Click{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={
                  '/u/' +
                  this.props.user.username +
                  '/teams/new/t/' +
                  this.state.tournament.id
                }
              >
                here
              </a>{' '}
              to create one.
            </div>
          )}
      </div>
    );
  }

  renderListPad(vtype) {
    const {tournament} = this.state;

    let game_settings =
      tournament && tournament.game_settings
        ? JSON.parse(tournament.game_settings)
        : {};
    if (!game_settings) {
      game_settings = {};
    }
    const game_settings_keys = Object.keys(game_settings);
    return (
      <div
        className={
          'list_pad tlist_pad ' +
          (vtype == 'desktop' ? 'd-none d-md-block' : 'd-md-none')
        }
      >
        <div className="row">
          <div className="col-md-4 col">
            <span> TOURNAMENT ID</span>
            <p>#{tournament.id}</p>
          </div>

          <div className="col-md-4 col">
            <span> STATUS</span>
            <p>
              {moment().isAfter(moment(tournament.starts_at))
                ? this.dynamicStatus()
                : tournament.status}
            </p>
          </div>

          <div className="col-md-4 col">
            <span>Registered</span>
            <p>
              {tournament.teams_registered ? tournament.teams_registered : 0}
              {' / ' + tournament.total_teams}
            </p>
          </div>
          {game_settings_keys.map((k, i) => {
            if (k == 'match_available' || k == 'map_2' || k == 'map_3') {
              return false;
            }
            if (k == 'map_1' && this.state.tournament.status == 'started') {
              return (
                <>
                  <div className="col-md-4 col-6 textcap" key={k}>
                    <span>{'Maps'}</span>
                    <p>
                      <strong>Map 1: </strong>
                      {game_settings.map_1}
                      {game_settings.map_2 ? (
                        <>
                          <br />
                          <strong>Map 2: </strong>
                          {game_settings.map_2}
                        </>
                      ) : (
                        false
                      )}
                      {game_settings.map_3 ? (
                        <>
                          <br />
                          <strong>Map 3: </strong>
                          {game_settings.map_3}
                        </>
                      ) : (
                        false
                      )}
                    </p>
                  </div>
                </>
              );
            }
            if (k == 'map_1') {
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
        {this.renderJoin()}
      </div>
    );
  }

  render() {
    const {tournament} = this.state;

    let game_settings =
      tournament && tournament.game_settings
        ? JSON.parse(tournament.game_settings)
        : {};
    if (!game_settings) {
      game_settings = {};
    }
    return (
      <div>
        <section
          className="page_title_bar tourinfo single-finder-match nombbtm single-tournament-info"
          style={{
            backgroundImage: tournament.banner_url
              ? 'url(' + tournament.banner_url + ')'
              : tournament.game.banner_url
                ? 'url(' + tournament.game.banner_url + ')'
                : "url('images/thumbnail_tournament.jpg')"
          }}
        >
          <div className="container tcontainer">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  {tournament.member_tournament ? (
                    <img
                      src="/assets/icons/ocg_member_gold.png"
                      className="star_img big"
                    />
                  ) : (
                    false
                  )}
                  <div className="match_heading tmheading">
                    <h4>{tournament.title}</h4>
                  </div>
                  <div className="row">
                    <div className="col-12 col-md">
                      <span className="game_station">
                        <span
                          className={
                            game_user_ids.tag_icons[tournament.ladder.gamer_tag]
                          }
                        />
                        {tournament.game.title} @ {tournament.ladder.title}
                      </span>
                      <div className="match_start_date">
                        {moment().isAfter(moment(tournament.starts_at))
                          ? 'Tournament Started:'
                          : 'Tournament Starts'}{' '}
                        {moment(tournament.starts_at).fromNow()}
                      </div>
                    </div>
                    <div className="col-12 col-md">
                      <div>
                        {moment().isAfter(
                          moment(tournament.registration_start_at)
                        )
                          ? 'Registration Started:'
                          : 'Registration Starts'}{' '}
                        {moment(tournament.registration_start_at).fromNow()}
                      </div>
                      <div>
                        {moment().isAfter(
                          moment(tournament.registration_end_at)
                        )
                          ? 'Registration Ended:'
                          : 'Registration Ends'}{' '}
                        {moment(tournament.registration_end_at).fromNow()}
                      </div>
                      <div>
                        <strong>Region: </strong>
                        {game_settings && game_settings['match_available']
                          ? utils.getCountryImage(
                              game_settings['match_available']
                            )
                          : ''}
                      </div>
                    </div>
                    <div className="col-12 col-md"> </div>
                  </div>

                  {this.renderListPad('desktop')}
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
                      this.setState(
                        {
                          renderTab: 'brackets'
                        },
                        () => {
                          this.createBrackets();
                        }
                      );
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

                <li
                  className={this.state.renderTab == 'matches' ? 'active' : ''}
                >
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'matches'
                      });
                    }}
                  >
                    Matches
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
        <section
          className={
            'contet_part single_match_details' +
            (this.state.renderTab == 'overview' ? ' dpt-0 ' : ' ')
          }
        >
          <div
            className={
              this.state.renderTab == 'brackets'
                ? 'container-fluid half'
                : 'container'
            }
          >
            <div className="row">
              {this.state.renderTab == 'overview'
                ? this.renderOverview()
                : false}
              {this.state.renderTab == 'brackets'
                ? this.renderBrackets()
                : false}
              {this.state.renderTab == 'teams' ? this.renderTeams() : false}
              {this.state.renderTab == 'rules' ? this.renderRules() : false}
              {this.state.renderTab == 'matches' ? this.renderMatch() : false}
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
