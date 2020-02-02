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
      membership_transactions: [],
      loaded: false
    };
    this.table1 = React.createRef();
    this.table2 = React.createRef();
    this.table3 = React.createRef();
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
                } else {
                  setTimeout(() => {
                    $(this.table1).footable();
                    $(this.table2).footable();
                    $(this.table3).footable();
                  }, 500);
                }
              } else {
                setTimeout(() => {
                  $(this.table1).footable();
                  $(this.table2).footable();
                  $(this.table3).footable();
                }, 500);
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
                      <table
                        className="table table-stripped"
                        ref={element => (this.table1 = element)}
                      >
                        <thead>
                          <tr>
                            <th style={{width: '7%'}}>Id</th>
                            <th style={{width: '23%'}}>Date</th>
                            <th class="d-none d-md-table-cell" style={{width: '55%'}}>
                              Description
                            </th>
                            <th style={{width: '15%'}}>OCH Cash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.cash_transactions.map((k, i) => {
                            return (
                              <tr key={k.id}>
                                <td>
                                  {(this.state.cash_page - 1) * 25 + i + 1}
                                </td>
                                <td>{moment(k.created_at).format('llll')}</td>
                                <td>{k.details}</td>
                                <td
                                  className={
                                    parseFloat(k.qty) > 0
                                      ? 'text-success'
                                      : 'text-danger'
                                  }
                                >
                                  $ {k.qty}
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
                      <table
                        className="table table-stripped"
                        ref={element => (this.table2 = element)}
                      >
                        <thead>
                          <tr>
                            <th style={{width: '7%'}}>Id</th>
                            <th style={{width: '23%'}}>Date</th>
                            <th class="d-none d-md-table-cell" style={{width: '55%'}}>
                              Description
                            </th>
                            <th style={{width: '15%'}}>Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.credit_transactions.map((k, i) => {
                            return (
                              <tr key={k.id}>
                                <td>
                                  {(this.state.credit_page - 1) * 25 + i + 1}
                                </td>
                                <td>{moment(k.created_at).format('llll')}</td>
                                <td>{k.details}</td>
                                <td
                                  className={
                                    parseFloat(k.qty) > 0
                                      ? 'text-success'
                                      : 'text-danger'
                                  }
                                >
                                  {k.qty} credits
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
                      <table
                        className="table table-stripped"
                        ref={element => (this.table3 = element)}
                      >
                        <thead>
                          <tr>
                            <th style={{width: '7%'}}>Id</th>
                            <th style={{width: '23%'}}>Date</th>
                            <th class="d-none d-md-table-cell" style={{width: '70%'}}>
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.membership_transactions.map((k, i) => {
                            return (
                              <tr key={k.id}>
                                <td>{i + 1}</td>
                                <td>{moment(k.created_at).format('llll')}</td>
                                <td>{k.descr}</td>
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
