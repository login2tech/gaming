import React from 'react';
import {connect} from 'react-redux';
import {charge, withdraw, transfer} from '../../../actions/stripe';
import Messages from '../../Modules/Messages';
class MyBankModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user_teams: []};
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({[event.target.name]: event.target.value});
  }
  proceedWithCreation(tokenObj) {
    const add_new_bal_number = this.state.add_new_bal_number;
    this.props.dispatch(
      charge(
        {
          stripe_token: tokenObj ? tokenObj.id : null,
          points_to_add: this.state.add_new_bal_number,
          init_transaction_mode: this.state.init_transaction_mode
        },
        this.props.token,
        res => {
          if (res) {
            this.setState(
              {
                clicked: false,
                buy_balance_init: false,
                add_new_bal_number: '',
                prev_success_type: 'insert'
              },
              () => {
                const usr = this.props.user;
                if (this.state.init_transaction_mode == 'credit') {
                  usr.credit_balance =
                    parseInt(usr.credit_balance) + parseInt(add_new_bal_number);
                } else {
                  usr.cash_balance =
                    parseInt(usr.cash_balance) + parseInt(add_new_bal_number);
                }
                this.props.dispatch({
                  type: 'UPDATE_USER',
                  user: usr
                });

                const element = document.getElementById('tab-block');
                if (element) {
                  element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest'
                  });
                }
              }
            );
          } else {
            this.setState({clicked: false}, () => {
              const element = document.getElementById('tab-block');
              if (element) {
                element.scrollIntoView({
                  behavior: 'smooth',
                  block: 'end',
                  inline: 'nearest'
                });
              }
            });
          }
        }
      )
    );
  }

  handleStripeCreation() {
    // const stripe = Stripe(this.STRIPE_KEY);
    let mode = this.props.settings.stripe_mode;
    if (mode != 'live') {
      mode = 'test';
    }

    const stripe = Stripe(
      this.props.settings['stripe_' + mode + '_publishable_key']
    );
    const elements = stripe.elements();
    const style = {
      base: {
        fontSize: '16px',
        border: '1px solid #ddd',
        lineHeight: '24px',
        color: '#fff'
      },
      invalid: {
        color: '#e5424d',
        ':focus': {
          color: '#fff'
        }
      }
    };
    const card = elements.create('card', {
      style: style,
      hidePostalCode: true,
      iconStyle: 'solid'
    });

    this.cardObj = card;
    this.stripe = stripe;
    setTimeout(this.mountCard.bind(this), 1000);
  }

  mountCard() {
    if (document.getElementById('cardElement')) {
      // alert();
      this.cardObj.mount('#cardElement');
      this.cardObj.on('change', event => this.setOutcome(event));
    }
  }

  setOutcome(result) {
    const successElement = document.querySelector('.outcome_success');
    const errorElement = document.querySelector('.outcome_error');
    successElement.classList.remove('visible');
    errorElement.classList.remove('visible');

    if (result.token) {
      this.proceedWithCreation(result.token);
    } else if (result.error) {
      errorElement.textContent = result.error.message;
      errorElement.classList.add('visible');
      this.setState({clicked: false});
    } else {
      errorElement.textContent = '';
      this.setState({clicked: false});
      errorElement.classList.remove('visible');
    }
  }

  handleCheckoutStep3(event) {
    //const tmp_this = this;
    this.setState({clicked: true});
    event.preventDefault();

    const extraDetails = {
      name: this.state.name_on_card
    };
    this.stripe
      .createToken(this.cardObj, extraDetails)
      .then(this.setOutcome.bind(this));
  }

  renderStripe() {
    const btn_label = this.state.clicked
      ? 'please wait...'
      : 'Complete purchase';
    return (
      <form
        onSubmit={this.handleCheckoutStep3.bind(this)}
        className="field_form"
      >
        <Messages messages={this.props.messages} />
        <div className="form-group row m-t-2">
          <label
            htmlFor="name_on_card"
            className=" form-control-label text-white"
          >
            Name on Card
          </label>
          <br />
          <div className="col-sm-12">
            <input
              type="text"
              required
              autoFocus
              name="name_on_card"
              placeholder="Enter name on card"
              id="name_on_card"
              className="form-control text-black"
              value={this.state.name_on_card}
              onChange={this.handleChange.bind(this)}
            />
          </div>
        </div>
        <div className="form-group row">
          <label
            htmlFor="card_number"
            className="  form-control-label  text-white"
          >
            Card Number
          </label>
          <br />
          <div className="col-sm-12">
            <div id="card-errors" role="alert" />
            <div id="cardElement" />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3"> </div>
          <div className="col-sm-7">
            <div className="outcome_error text-danger" role="alert" />
            <div className="outcome_success  text-success">
              <div className="token" />
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-md-12 text-center">
            <button
              type="submit"
              disabled={this.state.clicked}
              className="btn-01 btn btn-primary"
            >
              {btn_label}
            </button>
          </div>
        </div>
      </form>
    );
  }

  withdrawFormSubmit(e) {
    e.preventDefault();

    this.props.dispatch(
      withdraw(
        {
          amount_to_withdraw: this.state.amount_to_withdraw,
          withdraw_method: this.state.withdraw_method,
          withdraw_path: this.state.withdraw_path
        },

        st => {
          this.setState({
            init_transaction_mode: false,
            prev_success_type: 'withdraw'
          });
          // const obj = {saving_cover_photo: false};
          // if (st) {
          //   obj.new_cover_pic = '';
          //   obj.new_cover_pic_saved = false;
          // }
          // this.setState(obj);
        }
      )
    );
  }

  handleTransferSubmit(e) {
    e.preventDefault();

    this.props.dispatch(
      transfer(
        {
          amount_to_transfer: this.state.amount_to_transfer,
          username_to_transfer: this.state.username_to_transfer
        },

        st => {
          this.setState({
            init_transaction_mode: false,
            prev_success_type: 'transfer'
          });
          // const obj = {saving_cover_photo: false};
          // if (st) {
          //   obj.new_cover_pic = '';
          //   obj.new_cover_pic_saved = false;
          // }
          // this.setState(obj);
        }
      )
    );
  }

  renderWithDrawBox() {
    return (
      <div className="row">
        <div className="col-md-12">
          <hr />
          <div className="contnet_box_border">
            <form
              onSubmit={this.withdrawFormSubmit.bind(this)}
              className="field_form"
            >
              <div className="form-group   m-t-2">
                <label
                  htmlFor="amount_to_withdraw"
                  className=" form-control-label text-white"
                >
                  Amount to Withdraw
                </label>
                <input
                  type="number"
                  min="1"
                  max={this.props.user.cash_balance}
                  required
                  autoFocus
                  name="amount_to_withdraw"
                  placeholder=""
                  id="amount_to_withdraw"
                  className="form-control text-black"
                  value={this.state.amount_to_withdraw}
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              <div className="form-group   m-t-2">
                <label
                  htmlFor="withdraw_method"
                  className=" form-control-label text-white"
                >
                  Withdraw Method
                </label>

                <select
                  // type="text"
                  required
                  // autoFocus
                  name="withdraw_method"
                  // placeholder=""
                  id="withdraw_method"
                  className="form-control text-black"
                  value={this.state.withdraw_method}
                  onChange={this.handleChange.bind(this)}
                >
                  <option value="">Select</option>
                  <option value="paypal">Paypal</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="form-group  m-t-2">
                <label
                  htmlFor="withdraw_path"
                  className=" form-control-label text-white"
                >
                  {this.state.withdraw_method == 'paypal'
                    ? 'PayPal Id'
                    : this.state.withdraw_method == 'bank_transfer'
                      ? 'Bank Account Details: '
                      : this.state.withdraw_method == 'cheque'
                        ? 'Bank acccount and shipping address:'
                        : 'Withdrawal destination Details'}
                </label>
                <textarea
                  required
                  name="withdraw_path"
                  id="withdraw_path"
                  className="form-control text-black"
                  value={this.state.withdraw_path}
                  onChange={this.handleChange.bind(this)}
                />
              </div>
              <input
                type="submit"
                value="Withdraw"
                className="btn btn-primary"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }

  renderTransferBox() {
    return (
      <div className="row">
        <div className="col-md-12">
          <hr />
          <div className="contnet_box_border">
            <form
              onSubmit={this.handleTransferSubmit.bind(this)}
              className="field_form"
            >
              <Messages messages={this.props.messages} />
              <div className="form-group   m-t-2">
                <label
                  htmlFor="name_on_card"
                  className=" form-control-label text-white"
                >
                  Username to transfer to
                </label>
                <br />
                <div className="col-sm-12">
                  <input
                    type="text"
                    required
                    autoFocus
                    name="username_to_transfer"
                    placeholder="Enter name on card"
                    id="username_to_transfer"
                    className="form-control text-black"
                    value={this.state.username_to_transfer}
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
                <label
                  htmlFor="name_on_card"
                  className=" form-control-label text-white"
                >
                  Credits to transfer
                </label>
                <br />
                <div className="col-sm-12">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    max={this.props.user.credit_balance}
                    name="amount_to_transfer"
                    placeholder="Credits to transfer"
                    id="amount_to_transfer"
                    className="form-control text-black"
                    value={this.state.amount_to_transfer}
                    onChange={this.handleChange.bind(this)}
                  />
                </div>

                <input
                  type="submit"
                  value="Transfer"
                  disabled={
                    !this.state.amount_to_transfer ||
                    !this.state.username_to_transfer
                  }
                  className="btn btn-primary"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  renderBuyBox(type) {
    return this.state.buy_balance_init ? (
      <div className="row">
        <div className="col-md-12">
          <hr />
          <div className="contnet_box_border">{this.renderStripe()}</div>
        </div>
      </div>
    ) : (
      <div className="row">
        <form
          className="col-md-12 field_form"
          onSubmit={() => {
            this.setState({buy_balance_init: true}, () => {
              this.handleStripeCreation();
            });
          }}
        >
          <Messages messages={this.props.messages} />

          <div className="row">
            <div className="col-md-8">
              {this.state.init_transaction_mode == 'credit' ? (
                <select
                  type="number"
                  id="add_new_bal_number"
                  placeholder={'Add Credit Points'}
                  className="form-control"
                  name="add_new_bal_number"
                  value={this.state.add_new_bal_number}
                  onChange={this.handleChange.bind(this)}
                >
                  <option value="">Add Credits</option>
                  <option value="5">5 credits for $5</option>
                  <option value="10">10 credits for $10</option>
                  <option value="15">15 credits for $15</option>
                  <option value="25">25 credits for $25</option>
                  <option value="50">50 credits for $50</option>
                  <option value="75">75 credits for $75</option>
                  <option value="100">100 credits for $100</option>
                </select>
              ) : (
                <input
                  type="number"
                  id="add_new_bal_number"
                  placeholder={
                    this.state.init_transaction_mode == 'credit'
                      ? 'Add Credit Points'
                      : 'Deposit Cash'
                  }
                  className="form-control"
                  name="add_new_bal_number"
                  value={this.state.add_new_bal_number}
                  onChange={this.handleChange.bind(this)}
                />
              )}
            </div>
            <div className="col-md-4">
              <input
                type="submit"
                value="Buy Now"
                disabled={
                  this.state.add_new_bal_number == '' ||
                  this.state.add_new_bal_number == 0
                }
                className="btn btn-primary"
              />
            </div>
          </div>
        </form>
      </div>
    );
  }

  // componentDidMount() {
  //   this.fetchTeams();
  // }

  // fetchTeams() {
  //   fetch('/api/teams/team_of_user?uid=' + this.props.user_info.id)
  //     .then(res => res.json())
  //     .then(json => {
  //       if (json.ok) {
  //         this.setState(
  //           {
  //             user_teams: json.teams
  //           },
  //           () => {
  //             // this.fetchMatches();
  //           }
  //         );
  //       }
  //     });
  // }

  render() {
    return (
      <div className="tab-pane  text-center" data-tab="tab3">
        <div className="row">
          <div className="col-md-6 ">
            <div className="authorize_box">
              <div className="credit_summary ">
                Credit Balance
                <br />
                <img
                  src="/assets/icons/coin-01.png"
                  style={{
                    height: '150px',
                    marginTop: '20px',
                    marginBottom: '20px'
                  }}
                />
                <br /> {this.props.user.credit_balance}
              </div>
              {this.state.prev_success_type == 'transfer' ||
              this.state.prev_success_type == 'credit' ? (
                <Messages messages={this.props.messages} />
              ) : (
                false
              )}
              {this.state.init_transaction_mode == 'credit' ? (
                this.renderBuyBox('credit')
              ) : this.state.init_transaction_mode == 'transfer' ? (
                this.renderTransferBox('transfer')
              ) : (
                <div className="row">
                  <div className="col-md-6 text-center">
                    <input
                      type="button"
                      value="Add Credits"
                      onClick={() => {
                        this.setState({init_transaction_mode: 'credit'});
                        this.props.dispatch({
                          type: 'CLR_MSG'
                        });
                      }}
                      className="btn btn-default bttn_submit"
                    />
                  </div>
                  <div className="col-md-6 text-center">
                    <input
                      type="button"
                      value="Transfer"
                      onClick={() => {
                        this.setState({init_transaction_mode: 'transfer'});
                        this.props.dispatch({
                          type: 'CLR_MSG'
                        });
                      }}
                      className="btn btn-default bttn_submit"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6 ">
            <div className="authorize_box">
              <div className="credit_summary ">
                OCG Cash Balance
                <br />
                <img
                  src="/assets/icons/money-01.png"
                  style={{
                    height: '150px',
                    marginTop: '20px',
                    marginBottom: '20px'
                  }}
                />
                <br /> ${this.props.user.cash_balance}
              </div>

              {this.state.prev_success_type == 'withdraw' ? (
                <Messages messages={this.props.messages} />
              ) : (
                false
              )}

              {this.state.init_transaction_mode == 'cash' ? (
                this.renderBuyBox('cash')
              ) : this.state.init_transaction_mode == 'Withdraw' ? (
                this.renderWithDrawBox()
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="submit"
                      value="Deposit"
                      onClick={() => {
                        this.setState({
                          buy_balance_init: false,
                          init_transaction_mode: 'cash'
                        });
                        this.props.dispatch({
                          type: 'CLR_MSG'
                        });
                      }}
                      className="btn btn-default bttn_submit"
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="submit"
                      value="Withdraw"
                      disabled={this.props.user.cash_balance < 0.1}
                      onClick={() => {
                        this.setState({
                          buy_balance_init: false,
                          init_transaction_mode: 'Withdraw'
                        });
                      }}
                      className="btn btn-default bttn_submit"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    settings: state.settings,
    token: state.auth.token,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(MyBankModule);
