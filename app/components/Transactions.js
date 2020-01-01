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
      cash_pagi: {},
      credit_pagi: {},
      credit_transactions: [],
      loaded: false
    };
  }

  componentDidMount() {
    this.fTx('cash');
  }

  fTx(type) {
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
              this.fTx('credit');
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
        <section className="page_title_bar">
          <div className="container">
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
                {/*}
                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-trophy" aria-hidden="true" /> XP
                    TRANSACTIONS
                  </h5>
                  <br />
                  <div className=" ">
                    <div className="table_wrapper"><table className="table table-stripped">
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>Description</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.xp_transactions.map((k, i) => {
                          return (
                            <tr key={k.id}>
                              <td>{i + 1}</td>
                              <td>{k.details}</td>
                              <td>{k.qty}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table></div>
                  </div>
                </div>


                */}

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
                            <th style={{width: '7%'}}>Id</th>
                            <th style={{width: '23%'}}>Date</th>
                            <th style={{width: '55%'}}>Description</th>
                            <th style={{width: '15%'}}>OCH Cash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.cash_transactions.map((k, i) => {
                            return (
                              <tr key={k.id}>
                                <td>
                                  {(this.state.cash_page - 1) * 5 + i + 1}
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
                      <table className="table table-stripped">
                        <thead>
                          <tr>
                            <th style={{width: '7%'}}>Id</th>
                            <th style={{width: '23%'}}>Date</th>
                            <th style={{width: '55%'}}>Description</th>
                            <th style={{width: '15%'}}>Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.credit_transactions.map((k, i) => {
                            return (
                              <tr key={k.id}>
                                <td>
                                  {(this.state.credit_page - 1) * 5 + i + 1}
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
