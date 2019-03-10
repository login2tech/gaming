import React from 'react';
import {connect} from 'react-redux';
import {charge} from '../../actions/stripe';
import Messages from '../Modules/Messages';

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
          points_to_add: this.state.add_new_bal_number
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
      <form onSubmit={this.handleCheckoutStep3.bind(this)}>
        <Messages messages={this.props.messages} />
        <div className="form-group row m-t-2">
          <label
            htmlFor="name_on_card"
            className="col-sm-3 form-control-label text-white"
          >
            Name on Card
          </label>
          <div className="col-sm-7">
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
            className="col-sm-3 form-control-label  text-white"
          >
            Card Number
          </label>
          <div className="col-sm-7">
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
        <hr />

        <div className="form-group row">
          <div className="col-md-12 text-center">
            <button
              type="submit"
              disabled={this.state.clicked}
              className="btn-01 btn btn-success"
            >
              {btn_label}
            </button>
          </div>
        </div>
      </form>
    );
  }

  renderStep4() {
    return (
      <div className="tab-pane" data-tab="tab3">
        <div className="credit_summary">
          Current Credit Balance: ${this.props.user.credit_balance}
        </div>
        <div className="row">
          {this.state.buy_balance_init ? (
            <div className="col-md-12">
              <div className="contnet_box_border">{this.renderStripe()}</div>
            </div>
          ) : (
            <form
              className="col-md-12"
              onSubmit={() => {
                this.setState({buy_balance_init: true}, () => {
                  this.handleStripeCreation();
                });
              }}
            >
              <Messages messages={this.props.messages} />
              <hr />
              <div className="row">
                <div className="col-md-6">
                  <h3 className=" text-white">Buy more credit points</h3>
                  <input
                    type="number"
                    id="add_new_bal_number"
                    placeholder="Buy Credit Points"
                    className="form-control"
                    name="add_new_bal_number"
                    value={this.state.add_new_bal_number}
                    onChange={this.handleChange.bind(this)}
                  />
                  <input
                    type="submit"
                    value="Buy Now"
                    disabled={
                      this.state.add_new_bal_number == '' ||
                      this.state.add_new_bal_number == 0
                    }
                    className="btn btn-default bttn_submit"
                  />
                </div>
              </div>
            </form>
          )}
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
            <tbody>
              <tr>
                <td>1st</td>
                <td className="lb-user">
                  <table>
                    <tbody>
                      <tr>
                        <td className="lb-userimg">
                          <a href="#">
                            <img src="images/img.jpg" />
                          </a>
                        </td>
                        <td>
                          <a href="#">KasuaaliTV</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td>4-1</td>
                <td>80%</td>
                <td>0</td>
                <td>560</td>
                <td>1</td>
              </tr>
              <tr>
                <td>1st</td>
                <td className="lb-user">
                  <table>
                    <tbody>
                      <tr>
                        <td className="lb-userimg">
                          <a href="#">
                            <img src="images/img.jpg" />
                          </a>
                        </td>
                        <td>
                          <a href="#">KasuaaliTV</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td>4-1</td>
                <td>80%</td>
                <td>0</td>
                <td>560</td>
                <td>1</td>
              </tr>
              <tr>
                <td>1st</td>
                <td className="lb-user">
                  <table>
                    <tbody>
                      <tr>
                        <td className="lb-userimg">
                          <a href="#">
                            <img src="images/img.jpg" />
                          </a>
                        </td>
                        <td>
                          <a href="#">KasuaaliTV</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td>4-1</td>
                <td>80%</td>
                <td>0</td>
                <td>560</td>
                <td>1</td>
              </tr>
            </tbody>
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
            <div className="row">
              <div className="col-md-4">
                <span>Active card:</span>
                <p>********4541</p>
              </div>

              <div className="col-md-4">
                <span>Credit Card expiration date: </span>
                <p>06/2020</p>
              </div>
              <div className="col-md-4">
                <span>Current billing cycle: </span>
                <p>$45 monthly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  renderStep1() {
    return (
      <div className="tab-pane" data-tab="tab0">
        <ul id="upcoming-tournament" className="tournament-list active">
          <li className="tournament-box">
            <div className="tournament-body">
              <a href="#" className="tournament-name">
                Manila masters Toronto 4v4
              </a>

              <span className="date">Oct.09.2018 - 02:35 PM</span>

              <figure>
                <img src="images/test.png" alt="Fortnite" />
              </figure>
            </div>

            <div className="tournament-footer">
              <div className="col">
                <div className="col-item">
                  <h5>2 Groups</h5>
                  <p>62 Teams</p>
                </div>
                <div className="col-item">
                  <h5>PLAYOUT</h5>
                  <p>ROUND ROBIN</p>
                </div>
                <div className="col-item">
                  <h5>Prize pool</h5>
                  <p>$ 450 USD</p>
                </div>
              </div>
            </div>
          </li>
          <li className="tournament-box">
            <div className="tournament-body">
              <a href="#" className="tournament-name">
                EU WINNERS League - Starter Division{' '}
              </a>

              <span className="date">Oct.25.2018 - 01:06 PM</span>

              <figure>
                <img src="images/csgo_logo.png" alt="" />
              </figure>
            </div>

            <div className="tournament-footer">
              <div className="col">
                <div className="col-item">
                  <h5>2 Groups</h5>
                  <p>32 Teams</p>
                </div>
                <div className="col-item">
                  <h5>PLAYOUT</h5>
                  <p>ROUND ROBIN</p>
                </div>
                <div className="col-item">
                  <h5>Prize pool</h5>
                  <p>$ 300 USD</p>
                </div>
              </div>
            </div>
          </li>

          <li className="tournament-box">
            <div className="tournament-body">
              <a href="#" className="tournament-name">
                EU WINNERS League - Starter Division{' '}
              </a>

              <span className="date">Oct.25.2018 - 01:06 PM</span>

              <figure>
                <img src="images/csgo_logo.png" alt="" />
              </figure>
            </div>

            <div className="tournament-footer">
              <div className="col">
                <div className="col-item">
                  <h5>2 Groups</h5>
                  <p>32 Teams</p>
                </div>
                <div className="col-item">
                  <h5>PLAYOUT</h5>
                  <p>ROUND ROBIN</p>
                </div>
                <div className="col-item">
                  <h5>Prize pool</h5>
                  <p>$ 300 USD</p>
                </div>
              </div>
            </div>
          </li>

          <li className="tournament-box">
            <div className="tournament-body">
              <a href="#" className="tournament-name">
                EU WINNERS League - Starter Division{' '}
              </a>

              <span className="date">Oct.25.2018 - 01:06 PM</span>

              <figure>
                <img src="images/csgo_logo.png" alt="" />
              </figure>
            </div>

            <div className="tournament-footer">
              <div className="col">
                <div className="col-item">
                  <h5>2 Groups</h5>
                  <p>32 Teams</p>
                </div>
                <div className="col-item">
                  <h5>PLAYOUT</h5>
                  <p>ROUND ROBIN</p>
                </div>
                <div className="col-item">
                  <h5>Prize pool</h5>
                  <p>$ 300 USD</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
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
                    {this.props.user.first_name} {this.props.user.last_name}
                  </h3>
                  <div className="game_platform_icon">About</div>
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MEMBER SINCE</span>
                        <p>10/16/18 11:08AM</p>
                      </div>

                      <div className="col-md-4">
                        <span> TIME ZONE </span>
                        <p>12/30/18 2:00PM</p>
                      </div>

                      <div className="col-md-4">
                        <span>LIFETIME EARNINGS</span>
                        <p>12/30/18 2:00PM</p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <span> PROFILE VIEWS</span>
                        <p>436</p>
                      </div>

                      <div className="col-md-4">
                        <span>Rank</span>
                        <p>4541</p>
                      </div>

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
                      className={this.state.currentStep == 3 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 3});
                      }}
                      data-tab="tab2"
                    >
                      Win/Loss Details
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
