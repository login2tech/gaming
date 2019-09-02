import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import { updateProfile, changePassword, deleteAccount } from '../../actions/auth';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';
import {openModal} from '../../actions/modals';

import NewLadder from '../Modules/Modals/NewLadder';

class Posts extends React.Component {
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
    Fetcher.get(
      '/api/admin/listPaged/posts?related=user&page=' + this.state.page
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
    if (!r) {
      return;
    }
    const key = 'del_';
    this.setState(
      {
        ['update_' + key + id]: true
      },
      () => {
        Fetcher.post('/api/admin/delete/posts', {id: id})
          .then(resp => {
            this.setState({
              ['update_' + key + id]: false
            });
            if (resp.ok) {
              this.props.dispatch({type: 'SUCCESS', messages: [resp]});
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
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'newladder',
        zIndex: 534,
        heading: 'New Ladder',
        content: <NewLadder onComplete={this.loadData.bind(this)} />
      })
    );
  }

  // gamer_tags = {
  //   tag_1: 'Xbox Live Gamertag',
  //   tag_2: 'PSN',
  //   tag_3: 'Epic Games Username',
  //   tag_4: 'Steam Username',
  //   tag_5: 'Battletag'
  // };
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
                className="btn btn-success btn-xs"
                onClick={this.addItem.bind(this)}
              >
                <i className="fa fa-plus" /> Add new Ladder
              </button>
            </div>
            <h2 style={{padding: 0, margin: 0}}>Posts</h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Post</th>
                  <th>Is a repost?</th>
                  <th>Type</th>
                  <th>Post By</th>
                  <th>reposts</th>
                  {/* <th>reposts count</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((u, i) => {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.post}</td>
                        <td>
                          {u.is_repost ? (
                            <span className="badge badge-success">Yes</span>
                          ) : (
                            false
                          )}
                        </td>
                        <td>
                          {u.video ? (
                            <span className="badge badge-primary">Video</span>
                          ) : u.image ? (
                            <span className="badge badge-primary">Image</span>
                          ) : (
                            <span className="badge badge-primary">Text</span>
                          )}
                        </td>
                        <td>{u.user ? '@' + u.user.username : ''}</td>
                        <td>{u.repost_count}</td>
                        <td>
                          <a
                            href={'/post/' + u.id}
                            target="_blank"
                            className="btn btn-primary btn-xs"
                          >
                            View <span className="fa fa-comment" />
                          </a>{' '}
                          <button
                            onClick={() => {
                              this.deleteItem(u.id);
                            }}
                            className="btn btn-danger btn-xs"
                          >
                            {this.state['update_del_' + u.id] ? (
                              <i className="fa fa-spinner fa-spin" />
                            ) : (
                              false
                            )}{' '}
                            Delete <span className="fa fa-trash" />
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

export default connect(mapStateToProps)(Posts);
