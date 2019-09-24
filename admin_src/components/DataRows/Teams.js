import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import {openModal} from '../../actions/modals';
import Messages from '../Messages';
import MoreInfo from '../Modules/Modals/MoreInfo';
// import OrdersList from '../Modules/Modals/OrdersList';
import ReactPaginate from 'react-paginate';
// import SellList from '../Modules/Modals/SellList';
import {IndexLink, Link} from 'react-router';

class Teams extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      items: [],
      refresh: false,
      pagination: {},
      showing_for: props.params && props.params.uid ? props.params.uid : 'all'
    };
  }

  handlePageClick = data => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({page: selected}, () => {
      this.loadUsers();
    });
  };

  static getDerivedStateFromProps(props, state) {
    if (
      state.showing_for == 'all' &&
      (!props || !props.params || !props.params.uid)
    ) {
      // console.log('here')
      return null;
    }
    if (props.params && props.params.uid) {
      if (props.params.uid != state.showing_for) {
        return {
          refresh: true,
          page: 1
        };
      }
      return null;
    } else if (state.showing_for != 'all') {
      return {
        refresh: true,
        page: 1
      };
    }
    // console.log('here2')
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.refresh !== prevState.refresh) {
      this.loadUsers();
    }
  }

  loadUsers() {
    let other_filter = '';
    let url = '';
    if (this.props.params && this.props.params.uid) {
      other_filter = 'filter_user_id=' + this.props.params.uid;

      url =
        '/api/admin/listPaged/team_u?' +
        other_filter +
        '&page=' +
        this.state.page +
        '&related=team_info,team_info.ladder,team_info.ladder.game_info,team_info.team_users,team_info.team_users.user_info';
    } else {
      url =
        '/api/admin/listPaged/teams?' +
        other_filter +
        '&page=' +
        this.state.page +
        '&related=ladder,ladder.game_info,team_users,team_users.user_info';
    }

    Fetcher.get(url)
      .then(resp => {
        if (resp.ok) {
          this.setState({
            is_loaded: true,
            items: resp.items,
            refresh: false,
            pagination: resp.pagination ? resp.pagination : {}
          });
        } else {
          this.setState({
            refresh: false
          });
          this.props.dispatch({
            type: 'FAILURE',
            messages: [resp]
          });
        }
      })
      .catch(err => {
        this.setState({
          refresh: false
        });
        const msg = 'Failed to load users';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  updateItem(id, data, key) {
    this.setState(
      {
        ['update_' + key + id]: true
      },
      () => {
        Fetcher.post('/api/admin/update/users', {id: id, data: data})
          .then(resp => {
            this.setState({
              ['update_' + key + id]: false
            });
            if (resp.ok) {
              this.loadUsers();
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

  componentDidMount() {
    this.loadUsers();
  }

  doAction(action, obj) {
    if (action == 'profile') {
      this.props.dispatch(
        openModal({
          type: 'custom',
          id: 'profile',
          zIndex: 534,
          heading: 'User Details - @' + obj.username,
          content: <MoreInfo data={obj} />
        })
      );
      return;
    }

    alert(action + ' ' + obj.id);
  }

  render() {
    if (!this.state.is_loaded) {
      return (
        <div className="container">
          <div className="panel">
            <div className="panel-body">
              <i className="fa fa-spinner fa-spin" style={{fontSize: 40}} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="container">
        <div className="panel">
          <div className="panel-body">
            <div className="text-right pull-right push-right align-right" />
            <h2 style={{padding: 0, margin: 0}}>
              {' '}
              Teams{' '}
              {this.props.params.uid
                ? ' of user #' + this.props.params.uid
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
                  <th>Team</th>
                  <th>Ladder</th>
                  <th>Game</th>
                  <th>Users</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((k, i) => {
                    let u = k;
                    if (u.team_info) {
                      u = u.team_info;
                    }

                    return (
                      <tr
                        key={u.id}
                        className={u.removed ? ' table-danger ' : ''}
                      >
                        <td>{u.id}</td>
                        <td>{u.title}</td>
                        <td>{u.ladder.title}</td>
                        <td>{u.ladder.game_info.title}</td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-primary btn-xs dropdown-toggle"
                              type="button"
                              data-toggle="dropdown"
                            >
                              Users List <span className="caret" />
                            </button>
                            <ul className="dropdown-menu">
                              {u.team_users &&
                                u.team_users.map((tu, j) => {
                                  return (
                                    <li
                                      key={tu.id}
                                      className={
                                        tu.removed ? ' table-danger  ' : ''
                                      }
                                    >
                                      <a
                                        href="#"
                                        onClick={e => {
                                          e.preventDefault();
                                          this.doAction(
                                            'profile',
                                            tu.user_info
                                          );
                                        }}
                                      >
                                        {'#' +
                                          tu.user_info.id +
                                          ' - @' +
                                          tu.user_info.username}{' '}
                                        ( {tu.user_info.first_name}{' '}
                                        {tu.user_info.last_name} )
                                      </a>
                                    </li>
                                  );
                                })}
                            </ul>
                          </div>
                        </td>
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
                                <Link to={'/matchfinder/' + u.id}>
                                  View Matches of Team
                                </Link>
                              </li>
                              <li>
                                <a target="_blank" href={'/teams/view/' + u.id}>
                                  View Public Profile of Team
                                </a>
                              </li>
                            </ul>
                          </div>
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
              forcePage={this.state.page - 1}
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

export default connect(mapStateToProps)(Teams);
