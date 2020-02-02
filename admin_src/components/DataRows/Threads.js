import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import { updateProfile, changePassword, deleteAccount } from '../../actions/auth';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';
import {openModal} from '../../actions/modals';
import ViewThread from '../Modules/Modals/ViewThread';

class Threads extends React.Component {
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
      '/api/admin/listPaged/threads?related=topic&page=' + this.state.page
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

  viewItem(id) {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'viewthread',
        modal_class: '   modal-lg',
        zIndex: 534,
        heading: 'View Thread',
        content: <ViewThread id={id} />
      })
    );
  }

  deleteItem(id) {
    const r = confirm('Are you sure you want to delete the thread? ');
    if (r == true) {
      //
    } else {
      return;
    }
    this.setState(
      {
        ['update_' + id]: true
      },
      () => {
        Fetcher.post('/api/admin/delete/threads', {id: id})
          .then(resp => {
            this.setState({
              ['update_' + id]: false
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
            <h2 style={{padding: 0, margin: 0}}>Threads</h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <div className="table-responsive"><table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Topic</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((u, i) => {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.title}</td>

                        <td>{u.topic && u.topic.title}</td>

                        <td>
                          <button
                            onClick={() => {
                              this.deleteItem(u.id);
                            }}
                            className="btn btn-danger btn-xs"
                          >
                            {this.state['update_' + u.id] ? (
                              <i className="fa fa-spinner fa-spin" />
                            ) : (
                              false
                            )}{' '}
                            Delete
                          </button>{' '}
                          <button
                            onClick={() => {
                              this.viewItem(u.id);
                            }}
                            className="btn btn-success btn-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table></div>

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

export default connect(mapStateToProps)(Threads);
