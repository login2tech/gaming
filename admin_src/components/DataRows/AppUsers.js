import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import {openModal} from '../../actions/modals';
import Messages from '../Messages';
import MoreInfo from '../Modules/Modals/MoreInfo';
import {Link} from 'react-router';
import ReactPaginate from 'react-paginate';
import CashHistory from '../Modules/Modals/CashHistory';
import moment from 'moment';
class AppUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      search: '',
      items: [],
      pagination: {}
    };
  }

  handlePageClick = data => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({page: selected}, () => {
      this.loadUsers();
    });
  };

  loadUsers() {
    Fetcher.get(
      '/api/admin/listPaged/users?per_page=50&filter_role=user&page=' +
        this.state.page
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
        const msg = 'Failed to load users';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  updateItem(id, data, key) {
    if (!key) {
      key = '';
    }
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
    } else if (action === 'show_xp') {
      this.props.dispatch(
        openModal({
          type: 'custom',
          id: 'tx',
          zIndex: 534,
          heading: 'User XP Transactions - @' + obj.username,
          content: <CashHistory type={'xp_tx'} id={obj.id} />
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
          content: <CashHistory type={'credits'} id={obj.id} />
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
          content: <CashHistory type={'cash'} id={obj.id} />
        })
      );
      return;
    }

    // alert(action + ' ' + obj.id);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
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
            <h2 style={{padding: 0, margin: 0}}> App Users</h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />

            <div className="form-group">
              <input
                type="text"
                required
                className="form-control"
                placeholder="type to search users"
                id="search"
                name="search"
                value={this.state.search}
                onChange={this.handleChange.bind(this)}
              />
            </div>
            <div className="table-responsive">
              <table className="table  table-hover table-striped table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>

                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>

                    <th>Status</th>
                    <th> </th>
                    <th> </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.items &&
                    this.state.items.map((u, i) => {
                      // return JSON.stringify(u);
                      if (this.state.search) {
                        let f_name =
                          u.first_name +
                          ' ' +
                          u.last_name +
                          ' ' +
                          u.email +
                          ' ' +
                          u.username;
                        f_name = f_name.toLowerCase();
                        const s = this.state.search.toLowerCase();
                        if (f_name.indexOf(s) > -1) {
                          //
                        } else {
                          return false;
                        }
                      }
                      return (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>
                            {u.first_name} {u.last_name}
                          </td>
                          <td>{u.username}</td>
                          <td>{u.email}</td>

                          <td>
                            {u.banned ? (
                              <span className="label label-danger">
                                In-Active
                              </span>
                            ) : (
                              <span className="label label-primary">
                                Active
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="dropdown">
                              <button
                                className="btn btn-primary btn-xs dropdown-toggle"
                                type="button"
                                data-toggle="dropdown"
                              >
                                Details
                                <span className="caret" />
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a
                                    href="#"
                                    onClick={e => {
                                      e.preventDefault();
                                      this.doAction('profile', u);
                                    }}
                                  >
                                    Profile Info
                                  </a>
                                </li>
                                <li>
                                  <a href={'/u/' + u.username} target="_blank">
                                    Public Profile
                                  </a>
                                </li>
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
                                <li>
                                  <Link to={'/teams/' + u.id}>Teams</Link>
                                </li>
                              </ul>
                            </div>
                          </td>
                          <td>
                            {!u.status ? (
                              <button
                                onClick={() => {
                                  this.updateItem(
                                    u.id,
                                    {
                                      status: true,
                                      ban_reason: ''
                                    },
                                    ''
                                  );
                                }}
                                className="btn btn-success btn-xs"
                              >
                                {this.state['update_' + u.id] ? (
                                  <i className="fa fa-spinner fa-spin" />
                                ) : (
                                  false
                                )}{' '}
                                Enable
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const a = prompt(
                                    'Please enter the reason and duration for banning the user?'
                                  );
                                  if (!a) {
                                    return a;
                                  }
                                  // return;
                                  this.updateItem(
                                    u.id,
                                    {
                                      status: false,
                                      ban_reason: a,
                                      ban_date: moment()
                                    },
                                    ''
                                  );
                                }}
                                className="btn btn-warning btn-xs"
                              >
                                {this.state['update_' + u.id] ? (
                                  <i className="fa fa-spinner fa-spin" />
                                ) : (
                                  false
                                )}{' '}
                                Disable
                              </button>
                            )}{' '}
                            <button
                              onClick={e => {
                                e.preventDefault();
                                this.updateItem(
                                  u.id,
                                  {
                                    role: 'admin'
                                  },
                                  'make_admin'
                                );
                              }}
                              className="btn btn-warning btn-xs"
                            >
                              {this.state['update_make_admin' + u.id] ? (
                                <i className="fa fa-spinner fa-spin" />
                              ) : (
                                false
                              )}{' '}
                              Make Admin
                            </button>
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
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(AppUsers);
