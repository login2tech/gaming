import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import moment from 'moment';
import {Link} from 'react-router';
const moment = require('moment');

import React from 'react';
class TMatches extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'tmatches'
      })
    );
  }

  dynamicStatus_match(match) {
    if (!match.team_2_id) {
      return 'Expired';
    }
    if (match.status == 'disputed') {
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

  getTeams(match) {
    return [match.team_1_info, match.team_2_info];
  }

  renderMatchLine(match, i, round) {
    if (match.match_round != round) {
      return false;
    }
    const teams = this.getTeams(match);

    return (
      <tr key={match.id}>
        <td>
          <a target="_blank" href={'/teams/view/' + teams[0].id}>
            {teams[0].title}
          </a>{' '}
          {match.result == 'team_1' ? (
            <span className="text-success">W</span>
          ) : match.result == 'team_2' ? (
            <span className="text-danger">L</span>
          ) : (
            ''
          )}
        </td>
        <td>
          <a target="_blank" href={'/teams/view/' + teams[1].id}>
            {teams[1].title}
          </a>{' '}
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
          <a target="_blank" href={'/tournament-match/' + match.id}>
            View <span className="h-o-p">Match</span>
          </a>
        </td>
      </tr>
    );
  }

  render() {
    let rounds = this.props.tournament.brackets;
    if (!rounds) {
      rounds = '[]';
    }
    rounds = JSON.parse(rounds);
    rounds = rounds.rounds_calculated;
    const rnds = [];
    for (let i = 0; i < rounds; i++) {
      rnds.push(i + 1);
    }
    return (
      <div style={{maxHeight: '50vh', overflowY: 'auto', padding: 10}}>
        {rnds.map((round, i) => {
          const getMatchCount = this.props.matches.filter(function(mitm) {
            return mitm.match_round == round ? true : false;
          }).length;
          if (getMatchCount < 1) {
            return false;
          }
          return (
            <div className="position-relative bg-white  " key={round}>
              <h3 className="prizes_desclaimer">Round {round}</h3>
              <div>
                <div className="table_wrapper">
                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        <th style={{width: '20%'}}>Team</th>
                        <th style={{width: '20%'}}>Opponent</th>
                        <th
                          className="d-md-table-cell d-none"
                          style={{width: '20%'}}
                        >
                          Date
                        </th>
                        <th
                          className="d-md-table-cell d-none"
                          style={{width: '20%'}}
                        >
                          Status
                        </th>
                        <th style={{width: '15%'}}>Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.props.matches.map((match, i) => {
                        return this.renderMatchLine(match, i, round);
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
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

export default connect(mapStateToProps)(TMatches);
