import React from 'react';
import {connect} from 'react-redux';
import {charge} from '../../actions/stripe';
import Messages from '../Modules/Messages';
import {Link} from 'react-router';
import moment from 'moment';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.user.email,
      first_name: props.user.first_name,
      last_name: props.user.last_name,
      gender: props.user.gender,
      age: props.user.age,
      add_new_bal_number: '',
      password: '',
      confirm: '',
      currentStep: 4,
      init_transaction_mode: '',
      clicked: false,

      name_on_card: ''
    };
  }

  handleChange(event) {
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
                add_new_bal_number: ''
                // current_step: 4,
                // backAllowed: false
              },
              () => {
                const usr = this.props.user;
                usr.credit_balance =
                  parseInt(usr.credit_balance) + parseInt(add_new_bal_number);
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
              <input
                type="number"
                id="add_new_bal_number"
                placeholder="Buy Credit Points"
                className="form-control"
                name="add_new_bal_number"
                value={this.state.add_new_bal_number}
                onChange={this.handleChange.bind(this)}
              />
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

  renderStep4() {
    return (
      <div className="tab-pane  text-center" data-tab="tab3">
        <div className="row">
          <div className="col-md-6 ">
            <div className="authorize_box">
              <div className="credit_summary ">
                Credit Balance
                <br />
                <br /> ${this.props.user.credit_balance}
              </div>
              {this.state.init_transaction_mode == 'credit' ? (
                this.renderBuyBox('credit')
              ) : (
                <div className="row">
                  <div className="col-md-6 offset-md-3 text-center">
                    <input
                      type="submit"
                      value="Add Credits"
                      onClick={() => {
                        this.setState({init_transaction_mode: 'credit'});
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
                Cash Balance
                <br />
                <br /> ${this.props.user.cash_balance}
              </div>
              {this.state.init_transaction_mode == 'cash' ? (
                this.renderBuyBox('cash')
              ) : (
                <div className="row">
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="submit"
                        value="Deposit"
                        onClick={() => {
                          this.setState({init_transaction_mode: 'cash'});
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
                          this.setState({init_transaction_mode: 'Withdraw'});
                        }}
                        className="btn btn-default bttn_submit"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderStep3() {
    return (
      <div className="tab-pane" data-tab="tab2">
        <div className="win_loss">
          <table id="threads-table" className="table table-striped table-gray">
            <thead>
              <tr>
                <th>Place</th>
                <th>Team Name</th>
                <th>W-L</th>
                <th>Win %</th>
                <th>Strk</th>
                <th>Xp</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody />
          </table>
        </div>
      </div>
    );
  }

  renderStep2() {
    return (
      <div className="tab-pane" data-tab="tab1">
        <div className="billing_details">
          <div className="list_pad">
            <h5 className="credit_summary">Prime Membership</h5>
            <div className="row">
              <div className="col-md-4">
                <span>Status:</span>
                <p>
                  <span className="text-danger">Disabled</span>{' '}
                  <Link to="/membership">Click to enable</Link>
                </p>
              </div>

              {/*  <div className="col-md-4">
              <span>Credit Card expiration date: </span>
              <p>06/2020</p>
            </div>

              <div className="col-md-4">
                <span>Current billing cycle: </span>
                <p>-</p>
              </div>*/}
            </div>
            <br />
            <br />
            <h5 className="credit_summary">Double XP</h5>
            <div className="row">
              <div className="col-md-4">
                <span>Status:</span>
                <p>
                  <span className="text-danger">Disabled</span>{' '}
                  <Link to="/membership">Click to enable</Link>
                </p>
              </div>
              {/*  <div className="col-md-4">
              <span>Credit Card expiration date: </span>
              <p>06/2020</p>
            </div>

              <div className="col-md-4">
                <span>Current billing cycle: </span>
                <p>-</p>
              </div>
          */}{' '}
            </div>
          </div>
        </div>
      </div>
    );
  }
  renderStep1() {
    return (
      <div className="tab-pane" data-tab="tab0">
        <ul id="upcoming-tournament" className="tournament-list active" />
      </div>
    );
  }

  render() {
    return (
      <div>
        <section className="page_title_bar less_padding">
          <div className="container">
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12">
                <div className="game_pic_tournament">
                  <img
                    className="img-fluid profile_pic_outline"
                    src="images/img.jpg"
                  />
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>
                    <a href={'/u/' + this.props.user.username}>
                      {this.props.user.first_name} {this.props.user.last_name}
                    </a>
                  </h3>
                  <div className="game_platform_icon">About</div>
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MEMBER SINCE</span>
                        <p>
                          {moment(this.props.user.created_at).format('lll')}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <span> TIME ZONE </span>
                        <p>
                          {this.props.user.timezone
                            ? this.props.user.timezone
                            : '-'}
                        </p>
                      </div>
                      {/*}
                      <div className="col-md-4">
                        <span>LIFETIME EARNINGS</span>
                        <p>12/30/18 2:00PM</p>
                      </div>*/}
                    </div>

                    <div className="row">
                      {/*}<div className="col-md-4">
                        <span> PROFILE VIEWS</span>
                        <p>436</p>
                      </div>

                      <div className="col-md-4">
                        <span>Rank</span>
                        <p>4541</p>
                      </div>
*/}
                      <div className="col-md-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="tab-block" id="tab-block">
                  <ul className="tab-mnu">
                    <li
                      className={this.state.currentStep == 1 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 1});
                      }}
                      data-tab="tab0"
                    >
                      Previous Tournamentes
                    </li>
                    <li
                      className={this.state.currentStep == 2 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 2});
                      }}
                      data-tab="tab1"
                    >
                      Billing Details
                    </li>
                    <li
                      data-tab="tab2"
                      className={this.state.currentStep == 3 ? 'active' : ''}
                    >
                      <Link to={'/u/' + this.props.user.username}>
                        Win/Loss Details
                      </Link>
                    </li>
                    <li
                      className={this.state.currentStep == 4 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 4});
                      }}
                      data-tab="tab3"
                    >
                      Credit Summary
                    </li>
                  </ul>

                  <div className="tab-cont">
                    {this.state.currentStep == 1 ? this.renderStep1() : false}
                    {this.state.currentStep == 2 ? this.renderStep2() : false}
                    {this.state.currentStep == 3 ? this.renderStep3() : false}
                    {this.state.currentStep == 4 ? this.renderStep4() : false}
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
  return {
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Profile);
