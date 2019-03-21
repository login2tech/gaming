import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import Messages from '../Modules/Messages';
// import {createTeam} from '../../actions/team';
import {charge} from '../../actions/stripe';

class Shop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      ladder: '',
      games: []
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    fetch('/api/games/list')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              games: json.items
            },
            () => {
              // this.fetchTeams();
            }
          );
        }
      });
  }

  proceedWithCreation(tokenObj) {
    const add_new_bal_number = this.state.add_new_bal_number;
    this.props.dispatch(
      charge(
        {
          stripe_token: tokenObj ? tokenObj.id : null,
          points_to_add: this.state.add_new_bal_number
            ? this.state.add_new_bal_number
            : '',
          init_transaction_mode: this.state.init_transaction_mode
        },
        this.props.token,
        res => {
          if (res) {
            const init_transaction_mode = this.state.init_transaction_mode;

            this.setState(
              {
                clicked: false,
                buy_balance_init: false,
                add_new_bal_number: '',

                init_transaction_mode: ''
              },
              () => {
                const usr = this.props.user;
                if (init_transaction_mode == 'credit') {
                  usr.credit_balance =
                    parseInt(usr.credit_balance) + parseInt(add_new_bal_number);
                } else if (init_transaction_mode == 'cash') {
                  usr.cash_balance =
                    parseInt(usr.cash_balance) + parseInt(add_new_bal_number);
                } else {
                  usr[init_transaction_mode] = true;
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

  mountCard() {
    if (document.getElementById('cardElement')) {
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

  handleStripeCreation() {
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

  renderStripe() {
    const btn_label = this.state.clicked
      ? 'please wait...'
      : 'Complete purchase';
    return (
      <form
        onSubmit={this.handleCheckoutStep3.bind(this)}
        className="field_form"
      >
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
    if (
      this.state.init_transaction_mode == 'prime' ||
      this.state.init_transaction_mode == 'double_xp'
    ) {
      return <div>{this.renderStripe()}</div>;
    }

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

  render() {
    return (
      <section className="middle_part_login">
        <div className="container text-center">
          <Messages messages={this.props.messages} />
          <div className="row" style={{marginBottom: '10px'}}>
            <div className="col-md-6">
              <div className="authorize_box text-center">
                <div className="credit_summary ">
                  Prime Membership
                  <br />
                  <br /> $5 / month
                </div>
                {this.state.init_transaction_mode == 'prime' ? (
                  this.renderBuyBox('prime')
                ) : (
                  <div className="row">
                    <div className="col-md-6 offset-md-3 text-center">
                      {this.props.user ? (
                        this.props.user.prime ? (
                          <p className="text-success">
                            You are already a prime member
                          </p>
                        ) : (
                          <input
                            type="submit"
                            value="Buy Prime"
                            onClick={() => {
                              this.setState(
                                {
                                  buy_balance_init: true,
                                  clicked: false,
                                  init_transaction_mode: 'prime'
                                },
                                () => {
                                  this.handleStripeCreation();
                                }
                              );
                            }}
                            className="btn btn-default bttn_submit"
                          />
                        )
                      ) : (
                        <Link
                          to="/login"
                          className="btn btn-default bttn_submit"
                        >
                          Get Prime
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="authorize_box text-center">
                <div className="credit_summary ">
                  Double XP <br />
                  <br /> $5 / month
                </div>
                {this.state.init_transaction_mode == 'double_xp' ? (
                  this.renderBuyBox('double_xp')
                ) : (
                  <div className="row">
                    <div className="col-md-6 offset-md-3 text-center">
                      {this.props.user ? (
                        this.props.user.double_xp ? (
                          <p className="text-success">
                            Double XP already enabled!
                          </p>
                        ) : (
                          <input
                            type="submit"
                            value="Enable Double XP"
                            onClick={() => {
                              this.setState(
                                {
                                  buy_balance_init: true,
                                  clicked: false,
                                  init_transaction_mode: 'double_xp'
                                },
                                () => {
                                  this.handleStripeCreation();
                                }
                              );
                            }}
                            className="btn btn-default bttn_submit"
                          />
                        )
                      ) : (
                        <Link
                          to="/login"
                          className="btn btn-default bttn_submit"
                        >
                          Enable Double XP
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="authorize_box text-center">
                <div className="credit_summary ">
                  Credit Balance
                  <br />
                  <br /> {this.props.user.credit_balance}
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
                          this.setState({
                            init_transaction_mode: 'credit',
                            clicked: false
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
              <div className="authorize_box text-center">
                <div className="credit_summary ">
                  Cash Balance
                  <br />
                  <br /> ${this.props.user.cash_balance}
                </div>
                {this.state.init_transaction_mode == 'cash' ? (
                  this.renderBuyBox('cash')
                ) : (
                  <div className="row">
                    <div className="col-md-6 offset-md-3 text-center">
                      <input
                        type="submit"
                        value="Deposit"
                        onClick={() => {
                          this.setState({
                            init_transaction_mode: 'cash',
                            clicked: false
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
      </section>
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
// export default SingleThread;
export default connect(mapStateToProps)(Shop);
