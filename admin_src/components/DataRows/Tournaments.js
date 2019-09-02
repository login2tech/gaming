import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import moment from 'moment';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';

import {openModal} from '../../actions/modals';
import CashHistory from '../Modules/Modals/CashHistory';
import NewTournament from '../Modules/Modals/NewTournament';
class Tournament extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      match_page: 1,
      items: [],
      matches: [],
      match_pagination: {},
      pagination: {}
    };
  }

  resolveDispute(id, team_id) {
    const key = 'dispute';
    this.setState(
      {
        ['update_' + key + id]: true
      },
      () => {
        Fetcher.post('/api/tournament/resolveDispute', {
          id: id,
          winner: team_id
        })
          .then(resp => {
            this.setState({
              ['update_' + key + id]: false
            });
            if (resp.ok) {
              this.loadData();
            } else {
              this.props.dispatch({type: 'FAILURE', messages: [resp]});
            }
          })
          .catch(err => {
            console.log(err);
            const msg = 'Failed to perform Action';
            this.props.dispatch({
              type: 'FAILURE',
              messages: [{msg: msg}]
            });
          });
      }
    );
  }

  createTournament() {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'newtournament',
        zIndex: 534,
        heading: 'New Tournament',
        content: <NewTournament onComplete={this.loadData.bind(this)} />
      })
    );
  }

  doAction(action, obj) {
    if (action === 'show_xp') {
      this.props.dispatch(
        openModal({
          type: 'custom',
          id: 'tx',
          zIndex: 534,
          heading: 'User XP Transactions - @' + obj.username,
          content: <CashHistory type={'xp_tx'} obj_type={'t_' + obj.id} />
        })
      );
      return;
    } else if (action === 'show_credit') {
      this.props.dispatch(
        openModal({
          type: 'custom',
          id: 'tx',
          zIndex: 534,
          heading: 'User Credit Transactions - @' + obj.username,
          content: <CashHistory type={'credits'} obj_type={'t_' + obj.id} />
        })
      );
      return;
    } else if (action === 'show_cash') {
      this.props.dispatch(
        openModal({
          type: 'custom',
          id: 'tx',
          zIndex: 534,
          heading: 'User Credit Transactions - @' + obj.username,
          content: <CashHistory type={'cash'} obj_type={'t_' + obj.id} />
        })
      );
      return;
    }

    alert(action + ' ' + obj.id);
  }

  handlePageClick = data => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({page: selected}, () => {
      this.loadData();
    });
  };

  handleMatchPageCount = data => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({match_page: selected}, () => {
      this.loadTournamentMatches();
    });
  };

  loadData() {
    let other = '';
    other = 'related=ladder,game';
    Fetcher.get(
      '/api/admin/listPaged/tournament?' + other + '&page=' + this.state.page
    )
      .then(resp => {
        if (resp.ok) {
          this.setState({
            is_loaded: true,
            items: resp.items,
            pagination: resp.pagination ? resp.pagination : {}
          });
        } else {
          this.props.dispatch({
            type: 'FAILURE',
            messages: [resp]
          });
        }
      })
      .catch(err => {
        // console.log(err);
        const msg = 'Failed to load users';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  showMatchesOf(t_id) {
    this.setState(
      {
        showing_matches_of: t_id,
        match_page: 1,
        match_pagination: {}
      },
      this.loadTournamentMatches
    );
  }

  loadTournamentMatches() {
    let other = '';
    other = 'related=team_1_info,team_2_info';
    // if (this.props.params && this.props.params.team_id) {
    other += '&filter_tournament_id=' + this.state.showing_matches_of;
    // }
    console.log('doing');
    Fetcher.get(
      '/api/admin/listPaged/tournamentmaches?' +
        other +
        '&page=' +
        this.state.match_page
    )
      .then(resp => {
        if (resp.ok) {
          this.setState({
            is_loaded: true,
            matches: resp.items,
            match_pagination: resp.pagination ? resp.pagination : {}
          });
        } else {
          this.props.dispatch({
            type: 'FAILURE',
            messages: [resp]
          });
        }
      })
      .catch(err => {
        // console.log(err);
        const msg = 'Failed to load users';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  resolveDispute(id, team_id) {
    const key = 'dispute';
    this.setState(
      {
        ['update_' + key + id]: true
      },
      () => {
        Fetcher.post('/api/money8/resolveDispute', {id: id, winner: team_id})
          .then(resp => {
            this.setState({
              ['update_' + key + id]: false
            });
            if (resp.ok) {
              this.loadData();
            } else {
              this.props.dispatch({type: 'FAILURE', messages: [resp]});
            }
          })
          .catch(err => {
            console.log(err);
            const msg = 'Failed to perform Action';
            this.props.dispatch({
              type: 'FAILURE',
              messages: [{msg: msg}]
            });
          });
      }
    );
  }

  // deleteItem(id) {
  //   const r = confirm('Are you sure you want to delete the user? ');
  //   if (r == true) {
  //   } else {
  //   }
  //   this.setState(
  //     {
  //       ['update_' + key + id]: true
  //     },
  //     () => {
  //       Fetcher.post('/api/admin/delete/matches', {id: id})
  //         .then(resp => {
  //           this.setState({
  //              ['update_' + key + id]: false
  //           });
  //           if (resp.ok) {
  //             this.loadData();
  //           } else {
  //             this.props.dispatch({type: 'FAILURE', messages: [resp]});
  //           }
  //         })
  //         .catch(err => {
  //           console.log(err);
  //           const msg = 'Failed to perform Action';
  //           this.props.dispatch({
  //             type: 'FAILURE',
  //             messages: [{msg: msg}]
  //           });
  //         });
  //     }
  //   );
  // }

  componentDidMount() {
    this.loadData();
  }

  addItem() {
    // todo
  }

  renderMatches() {
    if (!this.state.showing_matches_of) {
      return false;
    }
    return (
      <div>
        <div className="panel">
          <div className="panel-body">
            <h2 style={{padding: 0, margin: 0}}>
              Matches of Tournament #{this.state.showing_matches_of}
            </h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Round</th>
                  <th>Team 1</th>
                  <th>Team 2</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Match type</th>
                  <th>Team 1 Result</th>
                  <th>Team 2 Result</th>

                  <th>Actions</th>
                  <th>Starts At</th>
                </tr>
              </thead>
              <tbody>
                {this.state.matches &&
                  this.state.matches.map((u, i) => {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>

                        <td>{u.match_round}</td>
                        <td>
                          {u.result == 'team_2' ? (
                            <span className="text-danger">
                              {u.team_1_info.title}
                            </span>
                          ) : u.result == 'team_1' ? (
                            <span className="text-success">
                              {u.team_1_info.title}
                            </span>
                          ) : (
                            u.team_1_info.title
                          )}
                        </td>
                        <td>
                          {u.team_2_info ? (
                            u.result == 'team_1' ? (
                              <span className="text-danger">
                                {u.team_2_info.title}
                              </span>
                            ) : u.result == 'team_2' ? (
                              <span className="text-success">
                                {u.team_2_info.title}
                              </span>
                            ) : (
                              u.team_2_info.title
                            )
                          ) : (
                            <span className="text-danger">Yet to Join</span>
                          )}
                        </td>
                        <td>
                          {u.status == 'complete' ? (
                            <span className="badge badge-success">
                              Complete
                            </span>
                          ) : (
                            u.status
                          )}
                        </td>
                        <td>
                          {u.result ? (
                            u.result == 'team_2' ? (
                              'Team 2 Wins'
                            ) : u.result == 'team_1' ? (
                              'Team 1 Wins'
                            ) : u.result == 'disputed' ? (
                              <span className="text-danger">Disputed</span>
                            ) : (
                              <span className="text-warning">{u.result}</span>
                            )
                          ) : (
                            <span className="text-warning">Yet to declare</span>
                          )}
                        </td>
                        <td>
                          {u.match_type == 'paid'
                            ? '' + u.match_fee + '/- OCG CASH'
                            : 'FREE'}
                        </td>
                        <td>{u.team_1_result}</td>

                        <td>{u.team_2_result}</td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-primary btn-xs dropdown-toggle"
                              type="button"
                              data-toggle="dropdown"
                            >
                              Actions
                              <span className="caret" />
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <a href={'/m/' + u.id} target="_blank">
                                  View Match Public Page
                                </a>
                              </li>
                              <li>
                                <a
                                  href={'/teams/view/' + u.team_1_info.id}
                                  target="_blank"
                                >
                                  View Team 1 Public Page
                                </a>
                              </li>
                              {u.team_2_info ? (
                                <li>
                                  <a
                                    href={'/teams/view/' + u.team_2_info.id}
                                    target="_blank"
                                  >
                                    View Team 2 Public Page
                                  </a>
                                </li>
                              ) : (
                                false
                              )}

                              <li>
                                <a
                                  href="#"
                                  onClick={e => {
                                    e.preventDefault();
                                    this.doAction('show_xp', u);
                                  }}
                                >
                                  Show XP Transactions
                                </a>
                              </li>
                              <li>
                                <a
                                  href="#"
                                  onClick={e => {
                                    e.preventDefault();
                                    this.doAction('show_credit', u);
                                  }}
                                >
                                  Show Credit Transactions
                                </a>
                              </li>
                              <li>
                                <a
                                  href="#"
                                  onClick={e => {
                                    e.preventDefault();
                                    this.doAction('show_cash', u);
                                  }}
                                >
                                  Show Cash Transactions
                                </a>
                              </li>

                              {u.result == 'disputed' ? (
                                <li>
                                  <a
                                    href="#"
                                    onClick={e => {
                                      e.preventDefault();
                                      this.resolveDispute(u.id, 'team_1');
                                    }}
                                  >
                                    Resolve dispute by giving win to team 1
                                  </a>
                                </li>
                              ) : (
                                false
                              )}

                              {u.result == 'disputed' ? (
                                <li>
                                  <a
                                    href="#"
                                    onClick={e => {
                                      e.preventDefault();
                                      this.resolveDispute(u.id, 'team_2');
                                    }}
                                  >
                                    Resolve dispute by giving win to team 2
                                  </a>
                                </li>
                              ) : (
                                false
                              )}
                            </ul>
                          </div>
                        </td>
                        <td>{moment(u.starts_at).format('lll')}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={this.state.match_pagination.pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={this.handleMatchPageCount}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (!this.state.is_loaded) {
      return (
        <div className="container-fluid">
          <div className="panel">
            <div className="panel-body">
              <i className="fa fa-spinner fa-spin" style={{fontSize: 40}} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="container-fluid">
        <div className="panel">
          <div className="panel-body">
            <h2 style={{padding: 0, margin: 0}}>
              <button
                onClick={() => {
                  this.createTournament();
                }}
                className="btn btn-success pull-right btn-xs"
              >
                Create new Tournament
              </button>
              Tournaments{' '}
              {this.props.params && this.props.params.team_id
                ? ' of team #' + this.props.params.team_id
                : ''}
            </h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Game</th>
                  <th>Ladder</th>
                  <th>Total Teams</th>
                  <th>Total Joined</th>
                  <th>Status</th>
                  <th>Entry Fees</th>
                  <th>Max Players Per Team</th>
                  <th>Actions</th>
                  <th>Reg Period</th>
                  <th>Starts at</th>
                  <th>Actions</th>
                  {/*<th>Match type</th>
                  <th>Actions</th>

                  <th>Team 1</th>
                  <th>Team 2</th>
                  <th>Team 1 Result</th>
                  <th>Team 2 Result</th>*/}
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((u, i) => {
                    let team_1 = false;
                    let team_2 = false;
                    if (u.team_1) {
                      team_1 = u.team_1.split('|').map(function(a) {
                        return parseInt(a);
                      });
                    }
                    if (u.team_2) {
                      team_2 = u.team_2.split('|').map(function(a) {
                        return parseInt(a);
                      });
                    }
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.game.title}</td>
                        <td>{u.ladder.title}</td>
                        <td>{u.total_teams}</td>
                        <td>{u.teams_registered}</td>
                        <td>
                          {u.status == 'complete' ? (
                            <span className="badge badge-success">
                              Complete
                            </span>
                          ) : (
                            u.status
                          )}
                        </td>
                        <td>{u.entry_fee}</td>
                        <td>{u.max_players}</td>

                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-primary btn-xs dropdown-toggle"
                              type="button"
                              data-toggle="dropdown"
                            >
                              Actions <span className="caret" />
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <a href={'/t/' + u.id} target="_blank">
                                  View Public Page
                                </a>
                              </li>
                            </ul>
                          </div>
                        </td>

                        <td>
                          {moment(u.registration_start_at).format('lll')}{' '}
                          <code>to</code>{' '}
                          {moment(u.registration_end_at).format('lll')}
                        </td>
                        <td>{moment(u.starts_at).format('lll')}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => {
                              this.showMatchesOf(u.id);
                            }}
                          >
                            Show matches
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={this.state.pagination.pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={this.handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          </div>
        </div>

        {this.renderMatches()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Tournament);
