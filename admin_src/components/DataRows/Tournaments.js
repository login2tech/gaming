import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import moment from 'moment';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';

import {openModal} from '../../actions/modals';
import CashHistory from '../Modules/Modals/CashHistory';
import NewTournament from '../Modules/Modals/NewTournament';
import TMatches from '../Modules/Modals/TMatches';
import TBrackets from '../Modules/Modals/TBrackets';
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

  showMatchesOf(t_id, item) {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    this.setState(
      {
        showing_matches_of: t_id,
        showing_tour: item,
        match_page: 1,
        match_pagination: {}
      },
      this.loadTournamentMatches
    );
  }

  showBracketsOf(t_id, item) {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    this.setState(
      {
        showing_matches_of: t_id,
        showing_tour: item,
        match_page: 1,
        match_pagination: {}
      },
      () => {
        this.loadTournamentMatches('brackets');
      }
    );
  }

  loadTournamentMatches(type) {
    let other = '';
    other = 'related=team_1_info,team_2_info';
    // if (this.props.params && this.props.params.team_id) {
    other += '&filter_tournament_id=' + this.state.showing_matches_of;
    // }
    // console.log('doing');
    Fetcher.get(
      '/api/admin/listPaged/tournamentmaches?' +
        other +
        '&page=' +
        this.state.match_page
    )
      .then(resp => {
        if (resp.ok) {
          this.setState(
            {
              is_loaded: true,
              matches: resp.items,
              match_pagination: resp.pagination ? resp.pagination : {}
            },
            () => {
              if (type == 'brackets') {
                this.openBracketsPopup();
              } else {
                this.openMatchesPopup();
              }
            }
          );
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

  openBracketsPopup() {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'tmatches',
        modal_class: ' modal-lg',
        zIndex: 534,
        heading: 'Tournament Brackets',
        content: (
          <TBrackets
            matches={this.state.matches}
            modal_class=" modal-lg"
            tournament={this.state.showing_tour}
          />
        )
      })
    );
    return;
  }

  openMatchesPopup() {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'tmatches',
        modal_class: ' modal-lg',
        zIndex: 534,
        heading: 'Tournament Matches',
        content: (
          <TMatches
            matches={this.state.matches}
            modal_class=" modal-lg"
            tournament={this.state.showing_tour}
          />
        )
      })
    );
    return;
  }

  componentDidMount() {
    this.loadData();
  }

  cancelTournamentSoon(id) {
    this.setState(
      {
        ['cancel_' + id]: true
      },
      () => {
        const data = {
          registration_start_at: 'CURRENT_TIME',
          registration_end_at: 'CURRENT_TIME'
        };
        Fetcher.post('/api/admin/update/tournament', {id: id, data: data})
          .then(resp => {
            this.setState({
              ['cancel_' + id]: false
            });
            if (resp.ok) {
              this.props.dispatch({
                type: 'SUCCESS',
                messages: [
                  {
                    msg:
                      'Tournament has been cancelled. It will be reflected within next 5 minutes and if any team had joined the tournament, they will get a refund.'
                  },
                  {
                    msg:
                      'As a precaution, registrations have been stopped for the tournmant'
                  },
                  {
                    msg:
                      'Please do not try to cancel the tournmemnt untill its cancelled.'
                  }
                ]
              });
              this.loadData();
            } else {
              this.props.dispatch({type: 'FAILURE', messages: [resp]});
            }
          })
          .catch(err => {
            // console.log(err);
            const msg = 'Failed to perform Action';
            this.props.dispatch({
              type: 'FAILURE',
              messages: [{msg: msg}]
            });
          });
      }
    );
  }

  runAction(actions, id, item) {
    if (actions == 'brackets') {
      this.showBracketsOf(id, item);
    } else if (actions == 'matches') {
      this.showMatchesOf(id, item);
    }
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
            <div className="table-responsive">
              <table className="table  table-hover  table-responsive   table-striped table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Game</th>
                    <th>Ladder</th>
                    <th>Total Teams</th>
                    <th>Total Joined</th>

                    <th>Entry Fees</th>
                    <th>Max Players Per Team</th>

                    <th>Reg Period</th>
                    <th>Starts at</th>
                    <th>Actions</th>
                    <th>Status</th>
                    {/*<th>Match type</th>
                  <th>Actions</th>  <th>Actions</th>

                  <th>Team 1</th>
                  <th>Team 2</th>
                  <th>Team 1 Result</th>
                  <th>Team 2 Result</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {this.state.items &&
                    this.state.items.map((u, i) => {
                      // let team_1 = false;
                      // let team_2 = false;
                      // if (u.team_1) {
                      //   team_1 = u.team_1.split('|').map(function(a) {
                      //     return parseInt(a);
                      //   });
                      // }
                      // if (u.team_2) {
                      //   team_2 = u.team_2.split('|').map(function(a) {
                      //     return parseInt(a);
                      //   });
                      // }
                      return (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.title}</td>
                          <td>{u.game.title}</td>
                          <td>{u.ladder.title}</td>
                          <td>{u.total_teams}</td>
                          <td>{u.teams_registered}</td>

                          <td>{u.entry_fee}</td>
                          <td>{u.max_players}</td>

                          <td>
                            {moment(u.registration_start_at).format('lll')}{' '}
                            <code>to</code>{' '}
                            {moment(u.registration_end_at).format('lll')}
                          </td>
                          <td>{moment(u.starts_at).format('lll')}</td>
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
                                <li>
                                  <a
                                    href={'#'}
                                    onClick={e => {
                                      e.preventDefault();
                                      this.runAction('brackets', u.id, u);
                                    }}
                                  >
                                    View Brackets
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href={'#'}
                                    onClick={e => {
                                      e.preventDefault();
                                      this.runAction('matches', u.id, u);
                                    }}
                                  >
                                    View Matches
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                          <td>
                            {u.status == 'complete' ? (
                              <span className="badge badge-success">
                                Complete
                              </span>
                            ) : (
                              u.status
                            )}
                            {u.status == 'pending' ? (
                              <button
                                className="btn btn-xs btn-primary"
                                type="button"
                                onClick={() => {
                                  this.cancelTournamentSoon(u.id);
                                }}
                              >
                                {this.state['cancel_' + u.id] ? (
                                  <i className="fa fa-spinner fa-spin" />
                                ) : (
                                  false
                                )}{' '}
                                Cancel Tournament
                              </button>
                            ) : (
                              false
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

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
      </div>
    );
    // {this.renderMatches()}
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
