import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import moment from 'moment';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';

class MatchFinder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      items: [],
      pagination: {}
    };
  }

  handlePageClick = data => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({page: selected}, () => {
      this.loadData();
    });
  };

  loadData() {
    let other = '';
    other = 'related=ladder,game';
    // if(this.props.params && this.props.params.team_id)
    // {
    //   other += "&filter_team_id_for_match="+this.props.params.team_id;
    // }
    Fetcher.get(
      '/api/admin/listPaged/money8?' + other + '&page=' + this.state.page
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

    resolveDispute(id , team_id) {
    let key   = 'dispute'
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
              Money 8 Matches{' '}
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

                  <th>Status</th>
                  <th>Result</th>
                  <th>Match type</th>
                  <th>Actions</th>

                  <th>Team 1</th>
                  <th>Team 2</th>
                  <th>Team 1 Result</th>
                  <th>Team 2 Result</th>
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

                        <td>
                          {u.status == 'complete' ? (
                            <span className="badge badge-success">
                              Complete
                            </span>
                          ) : (
                            u.status
                          )}
                          
                          {u.status == 'pending'
                            ? ' (' + u.players_joined + '/' + u.players_total+')'
                            : ''}
                        </td>
                        <td>
                          {u.result ? (
                            u.result == 'team_2' ? (
                              'Team 2 Wins'
                            ) : u.result == 'team_1' ? (
                              'Team 1 Wins'
                            ) : u.result == 'dispute' ? (
                              <span className="text-danger">Disputed</span>
                            ) : (
                              <span className="text-warning">{u.result}</span>
                            )
                          ) : (
                            <span className="text-warning">Yet to declare</span>
                          )}
                        </td>
                        <td>
                          {u.match_type == 'cash'
                            ? '' + u.match_fee + '/- OCG CASH'
                            : u.match_type == 'credits'
                            ? '' + u.match_fee + '/- Credits'
                            : 'FREE'}
                        </td>

                        <td>
                          {team_1 && team_1.length ? (
                            <div className="dropdown">
                              <button
                                className="btn btn-primary btn-xs dropdown-toggle"
                                type="button"
                                data-toggle="dropdown"
                              >
                                Team 1 Users <span className="caret" />
                              </button>
                              <ul className="dropdown-menu">
                                {team_1.map((id, i) => {
                                  return (
                                    <li>
                                      <a href={'/uid/' + id} target="_blank">
                                        @{id}
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : (
                            false
                          )}
                        </td>

                        <td>
                          {team_2 && team_2.length ? (
                            <div className="dropdown">
                              <button
                                className="btn btn-primary btn-xs dropdown-toggle"
                                type="button"
                                data-toggle="dropdown"
                              >
                                Team 2 Users <span className="caret" />
                              </button>
                              <ul className="dropdown-menu">
                                {team_2.map((id, i) => {
                                  return (
                                    <li>
                                      <a href={'/uid/' + id} target="_blank">
                                        @{id}
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : (
                            false
                          )}
                        </td>

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
                                <a href={'/money8/' + u.id} target="_blank">
                                  View Match Public Page
                                </a>
                              </li>

                              {u.result == 'disputed' ? (
                                <li>
                                  <a
                                    href="#"
                                    onClick={e => {
                                      e.preventDefault();
                                      this.resolveDispute(u.id,'team_1');
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
                                      this.resolveDispute(u.id,'team_2');
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
                        <td>{u.team_1_result}</td>
                        <td>{u.team_2_result}</td>
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

export default connect(mapStateToProps)(MatchFinder);
