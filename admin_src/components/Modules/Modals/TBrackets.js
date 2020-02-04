import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import moment from 'moment';
// import {Link} from 'react-router';
// const moment = require('moment');

import React from 'react';
class TBrackets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tournament: {
        second_winner_price: 0,
        first_winner_price: 0,
        third_winner_price: 0,
        game: {},
        ladder: {},
        matches: [],
        team_ids: '',
        teams: []
      }
    };

    this.fetchTournament();
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'tmatches'
      })
    );
  }

  fetchTournament(skip) {
    fetch('/api/tournaments/single/' + this.props.tournament.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              tournament: json.item,
              users_data: json.users_data ? json.users_data : {}
            },
            this.createBrackets
          );
        }
      });
  }

  getTeams(match) {
    return [match.team_1_info, match.team_2_info];
  }

  cnt = 1;

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
        '">Match - ' +
        cnt +
        '</a>'
      );
    }
    return '';
  }
  getM(round, t1, t2) {
    return this.props.matches.filter(function(item) {
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

  get_team_name(id) {
    const {tournament} = this.state;
    const teams = tournament.teams;
    console.log(teams);
    if (!teams) {
      return '';
    }
    for (let i = teams.length - 1; i >= 0; i--) {
      if (teams[i].id == id) {
        return teams[i].title;
      }
    }
  }

  createBrackets() {
    this.cnt = 0;
    let brackets = this.props.tournament.brackets;

    if (!brackets) {
      return;
    }
    let teams = this.props.tournament.team_ids;
    teams = teams.split(',');
    brackets = JSON.parse(brackets);
    const rounds_c = brackets.rounds_calculated;

    const rounds = [];
    const round_titles = [];

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
            url: '/teams/view/' + team_2,
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
    // console.log(brackets.winner);
    if (brackets.winner) {
      // team_1 = teams[team_1 - 1];
      // console.log(teams, brackets.winner);
      rounds.push([
        {
          class: 'winner_round',
          is_winner: true,
          match_title: '',
          player1: {
            name: this.get_team_name(brackets.winner),
            ID: '' + brackets.winner,
            url: '/teams/view/' + brackets.winner,
            winner: true
          }
        }
      ]);
      round_titles.push('Winner');
    }
    // debugger;
    // console.log(rounds);
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
        // MORE OPTIONS HERE
      });
    }, 1000);
  }

  render() {
    const brackets = this.props.tournament.brackets;
    if (!brackets) {
      return (
        <div className="position-relative">
          <div className="alert alert-warning">
            Brackets are yet not generated
          </div>
        </div>
      );
    }
    return (
      <div
        className="position-relative bg-white"
        style={{overflow: 'scroll', maxHeight: '70vh'}}
      >
        <div className="brackets" />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    modals: state.modals.modals,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(TBrackets);
