import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import ReactPaginate from 'react-paginate';
import Messages from '../Messages';

class AdminUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      admin_users: [],
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
      '/api/admin/listPaged/users?filter_role=admin&page=' + this.state.page
    )
      .then(resp => {
        // console.log(resp);
        if (resp.ok) {
          this.setState({
            is_loaded: true,
            admin_users: resp.items,
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
  //       ['delete_' + id]: true
  //     },
  //     () => {
  //       Fetcher.post('/api/admin/delete/users', {id: id})
  //         .then(resp => {
  //           this.setState({
  //             ['delete_' + id]: false
  //           });
  //           if (resp.ok) {
  //             this.loadUsers();
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
    this.loadUsers();
  }

  addUser() {
    // todo
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
            <div className="text-right pull-right push-right align-right">
              {/*}        <button
                className="btn btn-success btn-xs"
                onClick={this.addUser.bind(this)}
              >
                <i className="fa fa-plus" /> Add new admin
              </button>*/}
            </div>
            <h2 style={{padding: 0, margin: 0}}>Admin Users</h2>
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
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.admin_users &&
                    this.state.admin_users.map((u, i) => {
                      return (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>
                            {u.first_name} {u.last_name}
                          </td>
                          <td>{u.username}</td>
                          <td>{u.email}</td>
                          <td>
                            {u.status ? (
                              <span className="label label-primary">
                                Active
                              </span>
                            ) : (
                              <span className="label label-danger">
                                In-Active
                              </span>
                            )}
                          </td>
                          <td>
                            {u.status ? (
                              <button
                                onClick={() => {
                                  this.updateItem(u.id, {
                                    status: false
                                  });
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
                            ) : (
                              <button
                                onClick={() => {
                                  this.updateItem(u.id, {
                                    status: true
                                  });
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
                            )}{' '}
                            <button
                              onClick={() => {
                                this.updateItem(
                                  u.id,
                                  {
                                    role: 'user'
                                  },
                                  'role_'
                                );
                              }}
                              className="btn btn-warning btn-xs"
                            >
                              {this.state['update_role_' + u.id] ? (
                                <i className="fa fa-spinner fa-spin" />
                              ) : (
                                false
                              )}{' '}
                              Make User
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

export default connect(mapStateToProps)(AdminUsers);
