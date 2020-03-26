import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import moment from 'moment';
import ReactPaginate from 'react-paginate';

// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

// import NotFound from './Pages/NotFound';

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cash_transactions: [],
      cash_page: 1,
      credit_page: 1,
      membership_page: 1,
      membership_pagi: {},
      cash_pagi: {},
      credit_pagi: {},
      credit_transactions: [],
      show_only: 'cash',
      membership_transactions: [],
      loaded: false
    };
  }

  componentDidMount() {
    this.fTx('cash', true);
  }

  fTx(type, proceed) {
    const pg = this.state[type + '_page'];
    fetch('/transactions/list?type=' + type + '&page=' + pg)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          // console.log('done');
          this.setState(
            {
              [type + '_transactions']: json.items,
              [type + '_pagi']: json.pagination
            },
            () => {
              if (proceed) {
                if (type == 'cash') {
                  this.fTx('credit', true);
                } else if (type == 'credit') {
                  this.fTx('membership');
                }
              }
            }
          );
        }
      });
  }

  handlePageClick = (data, typ) => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({[typ + '_page']: selected}, () => {
      this.fTx(typ);
    });
  };

  render() {
    // if (this.state.is_loaded && !this.state.is_page) {
    //   return <NotFound />;
    // }
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Transactions</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col">
                <img
                  onClick={() => {
                    this.setState({
                      show_only: 'cash'
                    });
                  }}
                  style={{height: 60}}
                  className={
                    this.state.show_only == 'cash' ? 'has_shdow mr-4' : 'mr-4'
                  }
                  src="/assets/icons/money-01.png"
                />

                <img
                  onClick={() => {
                    this.setState({
                      show_only: 'credits'
                    });
                  }}
                  style={{height: 60}}
                  className={
                    this.state.show_only == 'credits'
                      ? 'has_shdow mr-4'
                      : 'mr-4'
                  }
                  src="/assets/icons/coin-01.png"
                />

                <img
                  onClick={() => {
                    this.setState({
                      show_only: 'membership'
                    });
                  }}
                  style={{height: 60}}
                  className={
                    this.state.show_only == 'membership'
                      ? 'has_shdow mr-4'
                      : 'mr-4'
                  }
                  src="/assets/icons/ocg_member_gold.png"
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                {this.state.show_only == 'cash' ? (
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <img
                        src="/assets/icons/money-01.png"
                        style={{
                          height: '30px',
                          marginTop: '20px',
                          marginBottom: '20px'
                        }}
                      />{' '}
                      OCG CASH TRANSACTIONS
                    </h5>
                    <br />
                    <div className=" ">
                      <div className="table_wrapper">
                        <table className="table table-stripped">
                          <thead>
                            <tr>
                              <th style={{width: '6%'}}>Id</th>
                              <th style={{width: '24%'}}>Date</th>
                              <th
                                className="d-none d-md-table-cell"
                                style={{width: '55%'}}
                              >
                                Description
                              </th>
                              <th style={{width: '13%'}}>OCG Cash</th>
                              <th
                                style={{width: '13%'}}
                                className="d-none d-md-table-cell"
                              >
                                Balance
                              </th>
                              <th style={{width: '5%'}} className="d-md-none" />
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.cash_transactions.map((k, i) => {
                              return (
                                <React.Fragment key={k.id}>
                                  <tr key={k.id}>
                                    <td>
                                      {(this.state.cash_page - 1) * 25 + i + 1}
                                    </td>
                                    <td>
                                      {moment(k.created_at).format('llll')}
                                    </td>
                                    <td className="d-none d-md-table-cell">
                                      {k.details}
                                    </td>
                                    <td
                                      className={
                                        parseFloat(k.qty) > 0
                                          ? 'text-success'
                                          : 'text-danger'
                                      }
                                    >
                                      $ {k.qty}
                                    </td>
                                    <td className="d-none d-md-table-cell">
                                      {k.balance ? '$ ' + k.balance : ''}
                                    </td>
                                    <td className="d-md-none">
                                      <button
                                        className="btn btn-link"
                                        onClick={() => {
                                          this.setState({
                                            expanded:
                                              k.id == this.state.expand_id
                                                ? !this.state.expanded
                                                : true,
                                            expand_id: k.id
                                          });
                                        }}
                                      >
                                        <span
                                          className={
                                            this.state.expanded &&
                                            this.state.expand_id == k.id
                                              ? ' fa fa-minus'
                                              : ' fa fa-plus '
                                          }
                                        />
                                      </button>
                                    </td>
                                  </tr>

                                  {this.state.expanded &&
                                  this.state.expand_id == k.id ? (
                                    <tr>
                                      <td colSpan="4">
                                        <table className="table">
                                          <tbody>
                                            <tr>
                                              <td>Description</td>
                                              <td>{k.details}</td>
                                            </tr>
                                            <tr>
                                              <td>Balance</td>
                                              <td>
                                                {k.balance
                                                  ? '$ ' + k.balance
                                                  : ''}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  ) : (
                                    false
                                  )}
                                </React.Fragment>
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
                        pageCount={this.state.cash_pagi.pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={data => {
                          this.handlePageClick(data, 'cash');
                        }}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                      />
                    </div>
                  </div>
                ) : (
                  false
                )}
                {this.state.show_only == 'credits' ? (
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <img
                        src="/assets/icons/coin-01.png"
                        style={{
                          height: '40px',
                          marginTop: '20px',
                          marginBottom: '20px'
                        }}
                      />{' '}
                      CREDIT TRANSACTIONS
                    </h5>
                    <br />
                    <div className=" ">
                      <div className="table_wrapper">
                        <table className="table table-stripped">
                          <thead>
                            <tr>
                              <th style={{width: '6%'}}>Id</th>
                              <th style={{width: '24%'}}>Date</th>
                              <th
                                className="d-none d-md-table-cell"
                                style={{width: '55%'}}
                              >
                                Description
                              </th>
                              <th style={{width: '13%'}}>Credits</th>
                              <th
                                style={{width: '13%'}}
                                className="d-none d-md-table-cell"
                              >
                                Balance
                              </th>
                              <th style={{width: '5%'}} className="d-md-none" />
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.credit_transactions.map((k, i) => {
                              return (
                                <React.Fragment key={k.id}>
                                  <tr key={k.id}>
                                    <td>
                                      {(this.state.credit_page - 1) * 25 +
                                        i +
                                        1}
                                    </td>
                                    <td>
                                      {moment(k.created_at).format('llll')}
                                    </td>
                                    <td className="d-none d-md-table-cell">
                                      {k.details}
                                    </td>
                                    <td
                                      className={
                                        parseFloat(k.qty) > 0
                                          ? 'text-success'
                                          : 'text-danger'
                                      }
                                    >
                                      {k.qty} credits
                                    </td>
                                    <td className="d-none d-md-table-cell">
                                      {k.balance
                                        ? '' + k.balance + ' credits'
                                        : ''}
                                    </td>
                                    <td className="d-md-none">
                                      <button
                                        className="btn btn-link"
                                        onClick={() => {
                                          this.setState({
                                            expanded:
                                              k.id == this.state.expand_id
                                                ? !this.state.expanded
                                                : true,
                                            expand_id: k.id
                                          });
                                        }}
                                      >
                                        <span
                                          className={
                                            this.state.expanded &&
                                            this.state.expand_id == k.id
                                              ? ' fa fa-minus'
                                              : ' fa fa-plus '
                                          }
                                        />
                                      </button>
                                    </td>
                                  </tr>

                                  {this.state.expanded &&
                                  this.state.expand_id == k.id ? (
                                    <tr>
                                      <td colSpan="4">
                                        <table className="table">
                                          <tbody>
                                            <tr>
                                              <td>Description</td>
                                              <td>{k.details}</td>
                                            </tr>
                                            <tr>
                                              <td>Description</td>
                                              <td>
                                                {k.balance
                                                  ? '' + k.balance + ' credits'
                                                  : ''}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  ) : (
                                    false
                                  )}
                                </React.Fragment>
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
                        pageCount={this.state.credit_pagi.pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={data => {
                          this.handlePageClick(data, 'credit');
                        }}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                      />
                    </div>
                  </div>
                ) : (
                  false
                )}
                {this.state.show_only == 'membership' ? (
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <img
                        src="/assets/icons/ocg_member_gold.png"
                        style={{
                          height: '40px',
                          marginTop: '20px',
                          marginBottom: '20px'
                        }}
                      />{' '}
                      MEMBERSHIP TRANSACTIONS
                    </h5>
                    <br />
                    <div className=" ">
                      <div className="table_wrapper">
                        <table className="table table-stripped">
                          <thead>
                            <tr>
                              <th style={{width: '6%'}}>Id</th>
                              <th style={{width: '24%'}}>Date</th>
                              <th
                                className="d-none d-md-table-cell"
                                style={{width: '70%'}}
                              >
                                Description
                              </th>
                              <th
                                style={{width: '10%'}}
                                className="d-md-none"
                              />
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.membership_transactions.map((k, i) => {
                              return (
                                <React.Fragment key={k.id}>
                                  <tr key={k.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                      {moment(k.created_at).format('llll')}
                                    </td>
                                    <td className="d-none d-md-table-cell">
                                      {k.descr}
                                    </td>
                                    <td className="d-md-none">
                                      <button
                                        className="btn btn-link"
                                        onClick={() => {
                                          this.setState({
                                            expanded:
                                              k.id == this.state.expand_id
                                                ? !this.state.expanded
                                                : true,
                                            expand_id: k.id
                                          });
                                        }}
                                      >
                                        <span
                                          className={
                                            this.state.expanded &&
                                            this.state.expand_id == k.id
                                              ? ' fa fa-minus'
                                              : ' fa fa-plus '
                                          }
                                        />
                                      </button>
                                    </td>
                                  </tr>

                                  {this.state.expanded &&
                                  this.state.expand_id == k.id ? (
                                    <tr>
                                      <td colSpan="4">
                                        <table className="table">
                                          <tbody>
                                            <tr>
                                              <td>Description</td>
                                              <td>{k.descr}</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  ) : (
                                    false
                                  )}
                                </React.Fragment>
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
                        pageCount={this.state.membership_pagi.pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={data => {
                          this.handlePageClick(data, 'membership');
                        }}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                      />
                    </div>
                  </div>
                ) : (
                  false
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return state;
};

export default connect(mapStateToProps)(Transaction);
