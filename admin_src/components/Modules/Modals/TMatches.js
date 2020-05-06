import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import moment from 'moment';
import Fetcher from '../../../actions/Fetcher';
// import {Link} from 'react-router';
const moment = require('moment');
import Messages from '../../Messages';

import React from 'react';
class TMatches extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  doClose() {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    this.props.dispatch(
      closeModal({
        id: 'tmatches'
      })
    );
  }

  reverseMatch(match_id, match) {
    this.setState({
      loaded: false
    });

    Fetcher.post('/api/tournaments/reverseMatch', {
      match_id: match_id
    })
      .then(resp => {
        if (resp.ok) {
          // this.props.onComplete && this.props.onComplete();
          // this.doClose();
          this.setState({
            loaded: true
          });
          console.log(resp);
          this.props.dispatch({type: 'SUCCESS', messages: [{msg: resp.msg}]});
        } else {
          this.props.dispatch({type: 'FAILURE', messages: [resp]});
        }
      })
      .catch(err => {
        // console.log(err);
        this.setState({
          loaded: true
        });
        const msg = 'Failed to perform Action';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  dynamicStatus_match(match) {
    // if (!match.team_2_id) {
    //   return 'Expired';
    // }
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

  giveWinFree(m_id, win_given_to) {
    this.setState({
      loaded: false
    });
    const data = {
      id: m_id
    };
    if (win_given_to == 'team_1') {
      data.team_2_result = '0-1';
    } else {
      data.team_1_result = '0-1';
    }

    return fetch('/api/tournaments/saveScore', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          if (json.ok) {
            // this.props.onComplete && this.props.onComplete();
            // this.doClose();
            this.setState({
              loaded: true
            });
            this.props.loadData();
            // console.log(resp);
            this.props.dispatch({type: 'SUCCESS', messages: [{msg: json.msg}]});
          } else {
            this.props.dispatch({type: 'FAILURE', messages: [json]});
          }
        });
      } else {
        return response.json().then(json => {
          this.props.dispatch({
            type: 'FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  }

  getTeams(match) {
    return [match.team_1_info, match.team_2_info];
  }

  renderMatchLine(match, i, round, can_modify, can_modify_round) {
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
          {teams[1] ? (
            <a target="_blank" href={'/teams/view/' + teams[1].id}>
              {teams[1].title}
            </a>
          ) : (
            'BYE'
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
          <a target="_blank" href={'/tournament-match/' + match.id}>
            View <span className="h-o-p">Match</span>
          </a>{' '}
          {!match.result ? (
            <a
              onClick={e => {
                e.preventDefault();
                this.giveWinFree(match.id, 'team_1');
              }}
              href="#"
            >
              Win to Team 1
            </a>
          ) : (
            false
          )}{' '}
          {!match.result ? (
            <a
              onClick={e => {
                e.preventDefault();
                this.giveWinFree(match.id, 'team_2');
              }}
              href="#"
            >
              Win to team 2
            </a>
          ) : (
            false
          )}{' '}
          {can_modify &&
          can_modify_round == round &&
          match.result &&
          (match.result == 'team_1' || match.result == 'team_2') ? (
            <>
              <br />
              <a
                href="#"
                style={{background: 'rgba(255, 0, 0, 0.5)'}}
                onClick={e => {
                  e.preventDefault();
                  this.reverseMatch(match.id, match);
                }}
              >
                Give win to other team{' '}
              </a>
            </>
          ) : (
            false
          )}
        </td>
      </tr>
    );
  }

  render() {
    let rounds = this.props.tournament.brackets;
    // console.log(this.props.tournament);
    if (!rounds) {
      rounds = '{}';
    }
    let can_modify = false;

    rounds = JSON.parse(rounds);
    const orig_rounds = rounds;
    if (!rounds.winner) {
      can_modify = true;
    }
    rounds = rounds.rounds_calculated;

    let can_modify_round = 0;
    if (orig_rounds && orig_rounds.rounds_calculated) {
      can_modify_round = orig_rounds.rounds_calculated;
    }
    const rnds = [];
    for (let i = 0; i < rounds; i++) {
      rnds.push(i + 1);
    }
    // console.log(can_modify, can_modify_round);
    return (
      <div style={{maxHeight: '50vh', overflowY: 'auto', padding: 10}}>
        <Messages messages={this.props.messages} />
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
                        return this.renderMatchLine(
                          match,
                          i,
                          round,
                          can_modify,
                          can_modify_round
                        );
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
