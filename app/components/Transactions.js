import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

// import NotFound from './Pages/NotFound';

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cash_transactions: [],
      xp_transactions: [],
      credit_transactions: [],
      loaded: false
    };
  }

  componentDidMount() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    fetch('/transactions/list')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          console.log('done');
          this.setState({
            cash_transactions: json.cash_transactions,
            xp_transactions: json.xp_transactions,
            credit_transactions: json.credit_transactions,
            loaded: true
          });
        }
      });
  }

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
                    <table className="table table-stripped">
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
                    </table>
                  </div>
                </div>


                */}

                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-trophy" aria-hidden="true" /> OCG CASH
                    TRANSACTIONS
                  </h5>
                  <br />
                  <div className=" ">
                    <table className="table table-stripped">
                      <thead>
                        <tr>
                          <th style={{width: '10%'}}>Id</th>
                          <th style={{width: '75%'}}>Description</th>
                          <th style={{width: '15%'}}>OCH Cash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.cash_transactions.map((k, i) => {
                          return (
                            <tr key={k.id}>
                              <td>{i + 1}</td>
                              <td>{k.details}</td>
                              <td>{k.qty}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-trophy" aria-hidden="true" /> CREDIT
                    TRANSACTIONS
                  </h5>
                  <br />
                  <div className=" ">
                    <table className="table table-stripped">
                      <thead>
                        <tr>
                          <th style={{width: '10%'}}>Id</th>
                          <th style={{width: '75%'}}>Description</th>
                          <th style={{width: '15%'}}>Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.credit_transactions.map((k, i) => {
                          return (
                            <tr key={k.id}>
                              <td>{i + 1}</td>
                              <td>{k.details}</td>
                              <td>{k.qty}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
