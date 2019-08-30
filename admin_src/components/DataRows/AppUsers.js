import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import {openModal} from '../../actions/modals';
import Messages from '../Messages';
import MoreInfo from '../Modules/Modals/MoreInfo';
import OrdersList from '../Modules/Modals/OrdersList';
import BuyList from '../Modules/Modals/BuyList';
import SellList from '../Modules/Modals/SellList';
import {IndexLink, Link} from 'react-router';
import ReactPaginate from 'react-paginate';

class AppUsers extends React.Component {
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
    let selected = parseInt(data.selected) + 1;
    this.setState({ page: selected }, () => {
      this.loadUsers();
    });
  };


  loadUsers() {
    Fetcher.get(
      '/api/admin/listPaged/users?filter_role=user&page=' + this.state.page
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
    if(!key)
      key = '';
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
            <h2 style={{padding: 0, margin: 0}}> App Users</h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <table className="table  table-hover  table-responsive   table-striped table-bordered">
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
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.first_name} {u.last_name}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>

                        <td>
                          {u.banned ? (
                            <span className="label label-danger">
                              In-Active
                            </span>
                          ) : (
                            <span className="label label-primary">Active</span>
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
                                <a
                                  href={'/u/'+u.username}
                                  target='_blank'
                                  
                                >
                                  Public Profile
                                </a>
                              </li>
                            {/*  <li>
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
                                    this.doAction('show_credit', u);
                                  }}
                                >
                                  Show Cash Transactions
                                </a>
                              </li> */}
                              <li>
                                <Link
                                  to={"/teams/"+u.id}
                                >
                                  Teams
                                </Link>
                              </li>
                               
                            </ul>
                          </div>
                        </td>
                        <td >
                          {!u.status ? (
                            <button
                              onClick={() => {
                                this.updateItem(u.id, {
                                  status: true
                                }, '');
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
                                this.updateItem(u.id, {
                                  status: false
                                }, '');
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
                              onClick={(e) => {
                                e.preventDefault();
                                this.updateItem(u.id, {
                                  role: 'admin'
                                }, 'make_admin');
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
