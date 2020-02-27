import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import { updateProfile, changePassword, deleteAccount } from '../../actions/auth';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';
import {openModal} from '../../actions/modals';
import moment from 'moment';
import ReplyTicket from '../Modules/Modals/ReplyTicket';
import ViewTicket from '../Modules/Modals/ViewTicket';

class TicketsEscilated extends React.Component {
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
      '/api/admin/listPaged/tickets?per_page=100&filter_status=escilated&related=user&page=' +
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
        // console.log(err);
        const msg = 'Failed to load users';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  deleteItem(id) {
    const r = confirm('Are you sure you want to delete the ticket? ');
    if (r == true) {
      //
    } else {
      return;
    }
    this.setState(
      {
        ['delete_' + id]: true
      },
      () => {
        Fetcher.post('/api/admin/delete/tickets', {id: id})
          .then(resp => {
            this.setState({
              ['delete_' + id]: false
            });
            if (resp.ok) {
              this.loadData();
            } else {
              this.props.dispatch({type: 'FAILURE', messages: [resp]});
            }
          })
          .catch(err => {
            this.setState({
              ['delete_' + id]: false
            });
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

  reply(id) {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'replyticket',
        zIndex: 534,
        heading: 'View Ticket',
        content: <ReplyTicket id={id} />
      })
    );
  }
  veiwItem(id) {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'viewticket',
        modal_class: '   modal-lg',
        zIndex: 534,
        heading: 'View Ticket',
        content: <ViewTicket id={id} />
      })
    );
  }

  checkboxChange() {
    this.setState({showing_only_paid: !this.state.showing_only_paid});
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
            <h2 style={{padding: 0, margin: 0}}>Support Tickets - Escilated</h2>
            <div style={{float: 'right'}}>
              <label>
                <input
                  type="checkbox"
                  onChange={this.checkboxChange.bind(this)}
                />{' '}
                Filter tickets only from OCG Members
              </label>
            </div>
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
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.items &&
                    this.state.items.map((u, i) => {
                      if (
                        this.state.showing_only_paid == true &&
                        u.user.prime == false
                      ) {
                        return false;
                      }

                      return (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.title}</td>
                          <td>{u.type}</td>
                          <td>{u.status}</td>

                          <td>{u.user ? '@' + u.user.username : ' '}</td>
                          <td>{moment(u.created_at).format('lll')}</td>

                          <td>
                            <button
                              onClick={() => {
                                this.reply(u.id);
                              }}
                              className="btn btn-success btn-xs"
                            >
                              <span className="fa fa-reply" /> Reply
                            </button>{' '}
                            <button
                              onClick={() => {
                                this.veiwItem(u.id);
                              }}
                              className="btn btn-primary btn-xs"
                            >
                              <span className="fa fa-view" /> View
                            </button>{' '}
                            <button
                              onClick={() => {
                                this.deleteItem(u.id);
                              }}
                              className="btn btn-danger btn-xs"
                            >
                              {this.state['delete_' + u.id] ? (
                                <i className="fa fa-spinner fa-spin" />
                              ) : (
                                <span className="fa fa-trash" />
                              )}{' '}
                              Delete
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

export default connect(mapStateToProps)(TicketsEscilated);
