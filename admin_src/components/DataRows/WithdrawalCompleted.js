import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import NewGame from '../Modules/Modals/NewGame';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';
// import {openModal} from '../../actions/modals';
// import {openModal} from '../../actions/modals';
// import MoreInfoGeneric from '../Modules/Modals/MoreInfoGeneric';

class WithdrawalCompleted extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      items: [],
      pagination: {}
    };
  }

  checkboxChange() {
    this.setState({showing_only_paid: !this.state.showing_only_paid});
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
      '/api/admin/listPaged/withdrawal?related=user&filter_status=completed&page=' +
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
              Completed withdrawal Requests
            </h2>
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
            <div className="table-responsive"><table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Path</th>
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
                        <td>
                          {u.user && u.user.first_name + ' ' + u.user.last_name}
                        </td>
                        <td>{u.user && u.user.email}</td>
                        <td>{u.amount}</td>
                        <td>{u.method}</td>
                        <td>{u.path}</td>
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

export default connect(mapStateToProps)(WithdrawalCompleted);
