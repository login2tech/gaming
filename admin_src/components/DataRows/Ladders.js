import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import { updateProfile, changePassword, deleteAccount } from '../../actions/auth';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';

class Ladders extends React.Component {
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


  loadData() {
    Fetcher.get(
      '/api/admin/listPaged/ladders?page=' + this.state.page
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

  // updateItem(id, data, key) {
  //   this.setState(
  //     {
  //       ['update_' + key + id]: true
  //     },
  //     () => {
  //       Fetcher.post('/api/admin/update/users', {id: id, data: data})
  //         .then(resp => {
  //           this.setState({
  //             ['update_' + key + id]: false
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

  deleteItem(id) {
    const r = confirm('Are you sure you want to delete the user? ');
    if (r == true) {
    } else {
    }
    this.setState(
      {
        ['update_' + key + id]: true
      },
      () => {
        Fetcher.post('/api/admin/delete/ladders', {id: id})
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

  componentDidMount() {
    this.loadData();
  }

  addItem() {
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
              <button
                className="btn btn-success btn-sm"
                onClick={this.addItem.bind(this)}
              >
                <i className="fa fa-plus" /> Add new game
              </button>
            </div>
            <h2 style={{padding: 0, margin: 0}}>Admin Users</h2>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((u, i) => {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>
                          {u.title}
                        </td>
                        <td>
                           
                          <button
                            onClick={() => {
                              this.updateItem(
                                u.id,
                                {
                                  role: 'member'
                                },
                                'del_', true
                              );
                            }}
                            className="btn btn-danger btn-sm"
                          >
                            {this.state['update_del_' + u.id] ? (
                              <i className="fa fa-spinner fa-spin" />
                            ) : (
                              false
                            )}{' '}
                            Delete
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

export default connect(mapStateToProps)(Ladders);
