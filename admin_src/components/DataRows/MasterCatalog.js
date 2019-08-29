import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import { updateProfile, changePassword, deleteAccount } from '../../actions/auth';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';

class MasterCatalog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      master_catalog: [],
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


  loadItems() {
    Fetcher.get('/api/master_catalog/list?page=' + this.state.page)
      .then(resp => {
        // console.log(resp);
        if (resp.ok) {
          this.setState({
            is_loaded: true,
            master_catalog: resp.items,
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


  componentDidMount() {
    this.loadItems();
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
              <button
                className="btn btn-success btn-sm"
                onClick={this.addUser.bind(this)}
              >
                <i className="fa fa-plus" /> Add new item
              </button>
            </div>
            <h2 style={{padding: 0, margin: 0}}>Master catalog</h2>
            <p>This is used for suggestions of products while adding to lists in app</p>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Actions</th>
                   
                </tr>
              </thead>
              <tbody>
                {this.state.master_catalog &&
                  this.state.master_catalog.map((u, i) => {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>coming soon</td>
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

export default connect(mapStateToProps)(MasterCatalog);
