import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import NewGame from '../Modules/Modals/NewGame';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';
import {openModal} from '../../actions/modals';
import MoreInfoGeneric from '../Modules/Modals/MoreInfoGeneric';

class AdvertiseWithUs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      items: [],
      pagination: {}
    };
  }
  doAction(obj) {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'profile',
        zIndex: 534,
        heading: 'More Info - ' + obj.id,
        content: <MoreInfoGeneric data={obj} />
      })
    );
    return;
  }

  handlePageClick = data => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({page: selected}, () => {
      this.loadData();
    });
  };

  loadData() {
    Fetcher.get('/api/admin/listPaged/advertisers?page=' + this.state.page)
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
    // const k = '';
    const r = confirm('Are you sure you want to delete the item? ');
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
        Fetcher.post('/api/admin/delete/advertisers', {id: id})
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
            <h2 style={{padding: 0, margin: 0}}>
              Submissions for <code>Advertise with us</code> Form
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
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.items &&
                    this.state.items.map((u, i) => {
                      return (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.email}</td>
                          <td>
                            <button
                              className="btn btn-priamry btn-xs"
                              onClick={e => {
                                e.preventDefault();
                                this.doAction(u);
                              }}
                            >
                              More Info
                            </button>{' '}
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

export default connect(mapStateToProps)(AdvertiseWithUs);
