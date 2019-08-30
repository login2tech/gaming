import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import moment from 'moment';
import ReactPaginate from 'react-paginate';

import React from 'react';
class CashHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      items: [],
      pagination: {pageCount:1},
      page: 1
    };
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'tx'
      })
    );
  }

  handlePageClick = data => {
    // console.log(data)
    let selected = parseInt(data.selected) + 1;
    this.setState({ page: selected }, () => {
      this.fetchData();
    });
  };


  fetchData() {
    fetch('/api/admin/listPaged/'+this.props.type+'?filter_user_id=' + this.props.id +'&page=' + this.state.page).then(
      response => {
        if (response.ok) {
          return response.json().then(json => {
            if (json.ok) {
              this.setState({
                items: json.items ? json.items : [],
                loaded: true,
                 pagination: json.pagination ? json.pagination : {pageCount : 1}
              });
            }
          });
        }
      }
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  render() { 
    return (
      <div className="">
        {this.state.loaded ? (
          false
        ) : (
          <div className="show_loader">
            <div className="is_loader" />
          </div>
        )}
        <div>
          <div className="modal-body report_left_inner more_info_de">
            <table className="table table-stripped table-bordered table-hovered table-hover">
              <thead>
                <tr>
                   
                  <th>Details</th>
                  <th>Amount</th>
                  <th>Date/time</th>
                  
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((order, i) => {
                    return (
                      <tr>
                        <td>{order.details}</td>
                        <td>{order.qty}</td>
                        <td>{moment(order.created_at).format('lll')}</td>
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
    modals: state.modals.modals,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(CashHistory);
