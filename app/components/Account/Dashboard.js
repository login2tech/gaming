import React from 'react';
import {connect} from 'react-redux';
import {charge, withdraw, transfer} from '../../actions/stripe';
import Messages from '../Modules/Messages';
import timezones from '../Modules/timezones';
import {Link} from 'react-router';
import moment from 'moment';
import axios from 'axios';
import {accountPic} from '../../actions/auth';
import {
  updateProfile,
  stopRenewal,
  changePassword,
  logout
} from '../../actions/auth';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.user.email ? props.user.email : '',
      timezone: props.user.timezone ? props.user.timezone : '',
      first_name: props.user.first_name ? props.user.first_name : '',
      last_name: props.user.last_name ? props.user.last_name : '',
      gender: props.user.gender ? props.user.gender : '',
      dob: props.user.dob ? props.user.dob : '',
      add_new_bal_number: '',
      password: '',
      confirm: '',
      currentStep: 4,
      init_transaction_mode: '',
      clicked: false,
      gamer_tag_1: props.user.gamer_tag_1 ? props.user.gamer_tag_1 : '',
      gamer_tag_2: props.user.gamer_tag_2 ? props.user.gamer_tag_2 : '',
      gamer_tag_3: props.user.gamer_tag_3 ? props.user.gamer_tag_3 : '',
      gamer_tag_4: props.user.gamer_tag_4 ? props.user.gamer_tag_4 : '',
      gamer_tag_5: props.user.gamer_tag_5 ? props.user.gamer_tag_5 : '',
      gamer_tag_6: props.user.gamer_tag_6 ? props.user.gamer_tag_6 : '',

      name_on_card: '',

      amount_to_withdraw: '',
      withdraw_method: '',
      withdraw_path: ''
    };
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({[event.target.name]: event.target.value});
  }

  handleLogout = event => {
    event.preventDefault();
    this.props.dispatch(logout());
  };

  handleProfileUpdate(event) {
    event.preventDefault();
    this.props.dispatch(
      updateProfile(
        {
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          gender: this.state.gender,
          dob: this.state.dob,
          gamer_tag_1: this.state.gamer_tag_1,
          timezone: this.state.timezone,
          gamer_tag_2: this.state.gamer_tag_2,
          gamer_tag_3: this.state.gamer_tag_3,
          gamer_tag_4: this.state.gamer_tag_4,
          gamer_tag_5: this.state.gamer_tag_5,
          gamer_tag_6: this.state.gamer_tag_6
        },
        this.props.token
      )
    );
    const element = document.body;
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  handleChangePassword(event) {
    event.preventDefault();
    this.props.dispatch(
      changePassword(this.state.password, this.state.confirm, this.props.token)
    );
    setTimeout(() => {
      // const element = document.body;
      const element = jQuery('.contet_part')[0];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
      this.setState({
        password: '',
        confirm: ''
      });
    }, 1000);
  }

  handleStopRenewal(event, item) {
    event.preventDefault();
    this.props.dispatch(stopRenewal(item, this.props.token));
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

  handleselectedFile = event => {
    this.setState(
      {
        profile_image_select: event.target.files[0],
        saving_profile_photo: true,
        loaded: 0
      },
      () => {
        this.askFile('profile_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_profile_pic: data.file,
              saving_profile_photo: false,
              new_profile_pic_saved: false
            });
          }
        });
      }
    );
  };

  handleCoverFile = event => {
    this.setState(
      {
        cover_image_select: event.target.files[0],
        saving_cover_photo: true,
        loaded: 0
      },
      () => {
        this.askFile('cover_image_select', data => {
          if (data && data.file) {
            this.setState({
              saving_cover_photo: false,
              new_cover_pic: data.file,
              new_cover_pic_saved: false
            });
          }
        });
      }
    );
  };

  doSaveProfilePic(event) {
    this.setState({
      saving_profile_photo: true
    });
    if (!this.state.new_profile_pic) {
      return;
    }

    event.preventDefault();
    this.props.dispatch(
      accountPic(
        {
          profile_picture: this.state.new_profile_pic
        },
        st => {
          const obj = {saving_profile_photo: false};
          if (st) {
            obj.new_profile_pic = '';
            obj.new_profile_pic_saved = false;
          }
          this.setState(obj);
        }
      )
    );
  }

  doSaveCoverPic(event) {
    if (!this.state.new_cover_pic) {
      return;
    }
    this.setState({
      saving_cover_photo: true
    });

    event.preventDefault();
    this.props.dispatch(
      accountPic(
        {
          cover_picture: this.state.new_cover_pic
        },

        st => {
          const obj = {saving_cover_photo: false};
          if (st) {
            obj.new_cover_pic = '';
            obj.new_cover_pic_saved = false;
          }
          this.setState(obj);
        }
      )
    );
  }

  askFile(cls, cb) {
    if (!this.state[cls]) {
      return;
    }
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          });
        }
      })
      .then(res => {
        // console.log(res.data);

        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured.');
        // console.log(err);
      });
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
                  Amount to transfer
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
                    placeholder="Enter name on card"
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
                  <option value="5">5 credits</option>
                  <option value="10">10 credits</option>
                  <option value="15">15 credits</option>
                  <option value="25">25 credits</option>
                  <option value="50">50 credits</option>
                  <option value="75">75 credits</option>
                  <option value="100">100 credits</option>
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

  renderStep4() {
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
              {this.state.prev_success_type == 'transfer' ? (
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
                          type: 'CLEAR_MESSAGES'
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
                          type: 'CLEAR_MESSAGES'
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
                        this.setState({init_transaction_mode: 'cash'});
                        this.props.dispatch({
                          type: 'CLEAR_MESSAGES'
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
                        this.setState({init_transaction_mode: 'Withdraw'});
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
  tags = [1, 2, 3, 4, 5, 6];
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    'Epic Games Username',
    'Steam Username',
    'Battletag',
    'Activision Id'
  ];

  renderStep5() {
    return (
      <div className="tab-pane" data-tab="tab2">
        <Messages messages={this.props.messages} />

        <form
          onSubmit={this.handleProfileUpdate.bind(this)}
          className="form-horizontal user_details_list"
        >
          <legend>Update Profile</legend>

          <Link
            className="text-danger"
            onClick={e => {
              this.handleLogout(e);
            }}
          >
            (logout?)
          </Link>
          <br />
          <br />
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  readOnly
                  value={this.state.email}
                  onChange={this.handleChange.bind(this)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  className="form-control"
                  value={this.state.first_name}
                  onChange={this.handleChange.bind(this)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  className="form-control"
                  value={this.state.last_name}
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              <div className="form-group ">
                <label>Gender</label>
                <div className="row" style={{height: '53px'}}>
                  <label className="radio-inline radio col-sm-4">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={this.state.gender === 'male'}
                      onChange={this.handleChange.bind(this)}
                    />
                    <span> Male</span>
                  </label>
                  <label className="radio-inline col-sm-4">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={this.state.gender === 'female'}
                      onChange={this.handleChange.bind(this)}
                    />
                    <span> Female</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="text"
                  name="dob"
                  id="dob"
                  className="form-control"
                  value={this.state.dob}
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  onChange={this.handleChange.bind(this)}
                  className="form-control"
                  name="timezone"
                  size={'normal'}
                  id="timezone"
                  value={this.state.timezone}
                  required
                >
                  <option value="">-Select-</option>
                  {timezones.map((timezone, i) => {
                    return (
                      <option value={timezone.value} key={timezone.label}>
                        {timezone.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              {this.tags.map((k, i) => {
                return (
                  <div className="form-group" key={k}>
                    <label htmlFor="last_name">{this.tag_names[k]}</label>
                    <input
                      type="text"
                      name={'gamer_tag_' + k}
                      id={'gamer_tag_' + k}
                      className="form-control"
                      value={this.state['gamer_tag_' + k]}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <button type="submit" className="btn btn-primary  max-width-300">
            Update Profile
          </button>
        </form>

        <br />
        <br />
        <form
          onSubmit={this.handleChangePassword.bind(this)}
          className="form-horizontal  user_details_list row"
        >
          <legend>Change Password</legend>
          <div className="form-group col-md-6">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className="form-control"
              value={this.state.password}
              onChange={this.handleChange.bind(this)}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              id="confirm"
              className="form-control"
              value={this.state.confirm}
              onChange={this.handleChange.bind(this)}
            />
          </div>

          <button type="submit" className="btn btn-primary max-width-300">
            CHANGE PASSWORD
          </button>
        </form>

        {/*}
          <div className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-12">
                <p>{facebookLinkedAccount}</p>
              </div>
            </div>
          </div><form
            onSubmit={this.handleDeleteAccount.bind(this)}
            className="form-horizontal"
          >
            <legend>
              <Translate id="delete_account" />
            </legend>
            <div className="form-group">
              <p className="col-sm-12">
                <Translate id="can_not_undo" />
              </p>
              <div className="col-sm-12">
                <button type="submit" className="btn btn-danger">
                  DELETE MY ACCOUNT
                </button>
              </div>
            </div>
          </form>*/}
      </div>
    );
  }

  renderStep2() {
    let prime_info = false;
    let tmp;
    let prime_obj = false;
    let double_xp_obj = false;
    if (this.props.user.prime) {
      tmp = JSON.parse(this.props.user.prime_obj);
      prime_obj = tmp;
      prime_info = (
        <span>
          <strong className="text-white">Started On: </strong>
          <span className="text-success">
            {moment.unix(tmp.start).format('lll')}
          </span>
        </span>
      );
    }
    let double_xp_info = false;
    if (this.props.user.double_xp) {
      tmp = JSON.parse(this.props.user.double_xp_obj);
      double_xp_obj = tmp;
      if (!tmp.starts_on) {
        double_xp_info = (
          <span>
            <strong className="text-white">Started Manually by admin</strong>
          </span>
        );
      } else {
        double_xp_info = (
          <span>
            <strong className="text-white">Started On: </strong>
            <span className="text-success">
              {moment(tmp.starts_on).format('lll')}
            </span>
          </span>
        );
      }
    }
    return (
      <div className="tab-pane" data-tab="tab1">
        <div className="billing_details">
          <div className="list_pad">
            <div className="row">
              <div className="col-md-6">
                <h5 className="credit_summary">Official Comp Membership</h5>
                <img
                  src="/assets/icons/ocg_member.png"
                  style={{
                    height: '150px',
                    marginTop: '20px',
                    marginBottom: '20px'
                  }}
                />
                {this.props.user.prime ? (
                  <p>
                    <strong className="text-white">Status:</strong>{' '}
                    <span className="text-success">enabled</span>
                    <br />
                    {prime_info}
                    <br />
                    {prime_obj.current_period_end ? (
                      <span>
                        <strong className="text-white">
                          {prime_obj.ending_on_period_end
                            ? 'Stops on: '
                            : 'Renews On'}
                          :{' '}
                        </strong>
                        <span className="text-success">
                          {moment
                            .unix(prime_obj.current_period_end)
                            .format('lll')}
                        </span>
                      </span>
                    ) : (
                      false
                    )}
                    <br />
                    <br />
                    {prime_obj.current_period_end &&
                    !prime_obj.ending_on_period_end ? (
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={e => {
                          this.handleStopRenewal(e, 'prime');
                        }}
                      >
                        Stop Renewing
                      </button>
                    ) : (
                      false
                    )}
                  </p>
                ) : (
                  <p>
                    <strong className="text-white">Status:</strong>{' '}
                    <span className="text-danger">Disabled</span>{' '}
                    <Link to="/shop">Click to enable</Link>
                  </p>
                )}
              </div>
              <div className="col-md-6">
                <h5 className="credit_summary">Double XP</h5>
                <img
                  src="/assets/icons/coin-02.png"
                  style={{
                    height: '150px',
                    marginTop: '20px',
                    marginBottom: '20px'
                  }}
                />
                {this.props.user.double_xp ? (
                  <p>
                    <strong className="text-white">Status:</strong>{' '}
                    <span className="text-success">enabled</span>
                    <br />
                    {double_xp_info}
                    <br />
                    {this.props.user.double_xp_exp ? (
                      <span>
                        <strong className="text-white">Ends on: </strong>
                        <span className="text-success">
                          {moment(this.props.user.double_xp_exp).format('lll')}
                        </span>
                      </span>
                    ) : (
                      false
                    )}
                    <br />
                    <br />
                    {double_xp_obj.current_period_end &&
                    !double_xp_obj.ending_on_period_end ? (
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={e => {
                          this.handleStopRenewal(e, 'double_xp');
                        }}
                      >
                        Stop Renewing
                      </button>
                    ) : (
                      false
                    )}
                  </p>
                ) : (
                  <p>
                    <strong className="text-white">Status:</strong>{' '}
                    <span className="text-danger">Disabled</span>{' '}
                    <Link to="/shop">Click to enable</Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const divStyle = this.state.new_cover_pic
      ? {
          backgroundImage: 'url(' + this.state.new_cover_pic + ')'
        }
      : this.props.user.cover_picture
        ? {
            backgroundImage: 'url(' + this.props.user.cover_picture + ')'
          }
        : {};

    return (
      <div>
        <section
          className="page_title_bar less_padding"
          id="is_top"
          style={divStyle}
        >
          {this.state.saving_cover_photo ? (
            <div className="photo_progress cover_progress">
              <span className="fa fa-spinner fa-spin" />
            </div>
          ) : (
            false
          )}
          <div className="update_btn cover">
            <label htmlFor="cover_image_select">
              <i className="fa fa-edit" /> upload cover
            </label>

            {this.state.new_cover_pic && !this.state.new_cover_pic_saved ? (
              <button
                onClick={event => {
                  this.doSaveCoverPic(event);
                }}
                type="button"
              >
                <i className="fa fa-save" /> save new cover
              </button>
            ) : (
              false
            )}

            <input
              type="file"
              name="cover_image_select"
              id="cover_image_select"
              className="hidden hide"
              accept="image/gif, image/jpeg, image/png"
              onChange={this.handleCoverFile.bind(this)}
            />
          </div>

          <div className="container">
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12">
                <div className="game_pic_tournament profile_pic_outline square">
                  <div className="content">
                    <div className="update_btn">
                      <label htmlFor="profile_image_select">
                        <i className="fa fa-edit" />
                      </label>

                      {this.state.new_profile_pic &&
                      !this.state.new_profile_pic_saved ? (
                        <button
                          onClick={event => {
                            this.doSaveProfilePic(event);
                          }}
                          type="button"
                        >
                          <i className="fa fa-save" />
                        </button>
                      ) : (
                        false
                      )}

                      <input
                        type="file"
                        name="profile_image_select"
                        id="profile_image_select"
                        className="hidden hide"
                        accept="image/gif, image/jpeg, image/png"
                        onChange={this.handleselectedFile}
                      />
                    </div>

                    {this.state.saving_profile_photo ? (
                      <div className="photo_progress">
                        <span className="fa fa-spinner fa-spin" />
                      </div>
                    ) : (
                      false
                    )}
                    {this.state.new_profile_pic ? (
                      <img
                        src={this.state.new_profile_pic}
                        className="img-fluid"
                      />
                    ) : this.props.user.profile_picture ? (
                      <img
                        src={this.props.user.profile_picture}
                        className="img-fluid "
                      />
                    ) : (
                      <img
                        className="img-fluid"
                        src={
                          'https://ui-avatars.com/api/?size=512&name=' +
                          this.props.user.first_name +
                          ' ' +
                          this.props.user.last_name +
                          '&color=223cf3&background=000000'
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3 className="no-case-change">
                    <Link to={'/u/' + this.props.user.username}>
                      @{this.props.user.username}
                    </Link>
                  </h3>
                  {/* <div className="game_platform_icon">About</div> */}
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-6">
                        <span> MEMBER SINCE</span>
                        <p>
                          {moment(this.props.user.created_at).format('lll')}
                        </p>
                      </div>

                      <div className="col-6">
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
                      data-tab="tab2"
                      className={
                        this.state.currentStep == 3
                          ? 'active float-right'
                          : 'float-right'
                      }
                    >
                      <Link to={'/u/' + this.props.user.username}>
                        Public Profile
                      </Link>
                    </li>

                    <li
                      data-tab="tab2"
                      className={this.state.currentStep == 5 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 5});
                      }}
                    >
                      Edit Profile
                    </li>
                    {/*}<li
                      className={this.state.currentStep == 1 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 1});
                      }}
                      data-tab="tab0"
                    >
                      Previous Tournamentes
                    </li>*/}
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
                    {this.state.currentStep == 2 ? this.renderStep2() : false}
                    {this.state.currentStep == 4 ? this.renderStep4() : false}
                    {this.state.currentStep == 5 ? this.renderStep5() : false}
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
