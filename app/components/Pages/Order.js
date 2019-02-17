import React from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import {Link} from 'react-router';
import {charge} from '../../actions/stripe';
import Messages from '../Modules/Messages';
import {Translate} from 'react-localize-redux';

class Order extends React.Component {
  STRIPE_KEY = 'pk_test_rgvtO5t5KnbVLLdNgYFT43yt';
  constructor(props) {
    super(props);
    this.state = {
      backAllowed: true,
      current_step: 1,
      email: this.props.user ? this.props.user.email : '',
      part_of_body: '',
      gender: this.props.user ? this.props.user.gender : '',
      age_group: '',
      description: '',
      mature: false,
      terms_accepted: false,
      image_path: '',
      selectedFile: null,
      mode: 'free',
      jury_age: '',
      jury_kind: '',
      jury_size: '',
      loaded: 0,
      plan_id: '',
      billing: {
        name_on_card: ''
      },
      plans: [
        {
          id: 1,
          jury_count: 30,
          plan_name: 'Basic',
          cost: 10
        },
        {
          id: 2,
          jury_count: 50,
          plan_name: 'Gold',
          cost: 12
        },
        {
          id: 3,
          jury_count: 100,
          plan_name: 'Premium',
          cost: 14
        },
        {
          id: 4,
          jury_count: 300,
          plan_name: 'Ultra',
          cost: 16
        }
      ]
    };
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
        lineHeight: '24px'
      },
      invalid: {
        color: '#e5424d',
        ':focus': {
          color: '#303238'
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

  proceedWithCreation(tokenObj) {
    this.props.dispatch(
      charge(
        {
          stripe_token: tokenObj ? tokenObj.id : null,
          email: this.state.email,
          part_of_body: this.state.part_of_body,
          gender: this.state.gender,
          age_group: this.state.age_group,
          description: this.state.description,
          mature: this.state.mature,
          terms_accepted: this.state.terms_accepted,
          image_path: this.state.image_path,
          selectedFile: this.state.selectedFile,
          mode: this.state.mode,
          jury_age: this.state.jury_age,
          jury_kind: this.state.jury_kind,
          plan_id: this.state.jury_size
          // todo baaki sb yha
        },
        this.props.token,
        res => {
          if (res) {
            this.setState(
              {
                clicked: false,
                current_step: 4,
                backAllowed: false
              },
              () => {
                const element = document.getElementById('mainHeader');
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
              const element = document.getElementById('mainHeader');
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

  handleChange(event) {
    if (this.state.billing[event.target.name] === undefined) {
      this.setState({[event.target.name]: event.target.value});
    } else {
      const billing = this.state.billing;
      billing[event.target.name] = event.target.value;
      this.setState({billing: billing});
    }
  }

  handleCheckoutStep3(event) {
    //const tmp_this = this;
    this.setState({clicked: true});
    event.preventDefault();

    const extraDetails = {
      name: this.state.billing.name_on_card
    };
    this.stripe
      .createToken(this.cardObj, extraDetails)
      .then(this.setOutcome.bind(this));
  }

  handleselectedFile = event => {
    this.setState(
      {
        selectedFile: event.target.files[0],
        loaded: 0
      },
      () => {
        this.handleUpload();
      }
    );
  };

  handleUpload = () => {
    const data = new FormData();
    data.append('file', this.state.selectedFile, this.state.selectedFile.name);

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
        this.setState({
          allowSubmit1: true,
          image_path: res.data.file
        });
        // console.log(res.statusText);
      });
  };

  submitStep1(event) {
    event.preventDefault();
    this.setState({current_step: 2}, () => {
      const element = document.getElementById('mainHeader');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    });
  }
  submitStep2(event) {
    event.preventDefault();
    if (this.state.mode == 'free') {
      this.proceedWithCreation(false);
      return;
    }
    this.setState({current_step: 3}, () => {
      this.handleStripeCreation();
      const element = document.getElementById('mainHeader');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    });
  }

  renderStep1() {
    // const Select_vl = (
    //   <Translate id="dropdown_select">{({translate}) => translate}</Translate>
    // );

    // console.log(Select_vl);
    return (
      <form
        className="row setup-content"
        id="step-1"
        onSubmit={this.submitStep1.bind(this)}
      >
        <div className="col-md-6">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="control-label">
                  <Translate id="order_email_label" />{' '}
                  <span className="required">*</span>
                </label>
                <input
                  type="hidden"
                  required
                  defaultValue={this.state.image_path}
                  name="image_path"
                />
                <input
                  maxLength="100"
                  type="email"
                  required
                  name="email"
                  onChange={this.handleChange.bind(this)}
                  id="email"
                  value={this.state.email}
                  className="form-control"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label className="control-label">
                  <Translate id="order_part_of_body_label" />{' '}
                  <span className="required">*</span>
                </label>
                <select
                  required
                  className="form-control"
                  name="part_of_body"
                  onChange={this.handleChange.bind(this)}
                  id="part_of_body"
                  value={this.state.part_of_body}
                >
                  <option value="">Select</option>
                  <option value="Arms">Arms</option>
                  <option value="Hair">Hair</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="control-label">
                  <Translate id="order_gener_label" />{' '}
                  <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  name="gender"
                  required
                  onChange={this.handleChange.bind(this)}
                  id="gender"
                  value={this.state.gender}
                >
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Man</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label className="control-label">
                  <Translate id="order_age_label" />{' '}
                  <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  name="age_group"
                  required
                  onChange={this.handleChange.bind(this)}
                  id="age_group"
                  value={this.state.age_group}
                >
                  <option value="">{'Select'}</option>
                  <option value="18-25 Years">18-25 Years</option>
                  <option value="25-35 Years">25-35 Years</option>
                  <option value="35-45 Years">35-45 Years</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="control-label">
              <Translate id="order_description_label" />
            </label>
            <textarea
              name="description"
              onChange={this.handleChange.bind(this)}
              id="description"
              required
              className="form-control"
              placeholder=""
              value={this.state.description}
            />
          </div>

          <div className="form-group col-md-12 col-sm-12 co-xs-12">
            <label className="switch">
              <input
                type="checkbox"
                required
                checked={this.state.mature}
                onChange={() => {
                  this.setState({
                    mature: !this.state.mature
                  });
                }}
                name="mature"
              />
              <span className="slider_switch round" />
            </label>
            <Translate id="order_mature_content_label" />
            <small>
              <Translate id="order_mature_content_description" />
            </small>
          </div>

          <div className="form-group col-md-12 col-sm-12 co-xs-12">
            <label className="switch">
              <input
                type="checkbox"
                checked={this.state.terms_accepted}
                onChange={() => {
                  this.setState({
                    terms_accepted: !this.state.terms_accepted
                  });
                }}
                name="terms_accepted"
              />
              <span className="slider_switch round" />
            </label>
            <Translate id="order_i_accept_terms" />
            <small>
              <Translate id="order_terms_details" />
            </small>
          </div>
          <button
            disabled={!this.state.allowSubmit1 || !this.state.terms_accepted}
            className="btn btn-primary nextBtn btn-lg pull-right"
            type="submit"
          >
            Proceed
          </button>
        </div>
        <div className="col-md-6">
          {/*<div className="info_box">
            <p>
              <span>
                <i className="fas fa-hourglass-half" /> Awaiting moderation{' '}
              </span>
              We must validate that your photo complies with our conditions of
              use . After this verification, your photo will be presented to
              your jury.
            </p>
          </div>*/}
          <div className="upload_pic">
            <input
              type="file"
              name="image_select"
              id="image_select"
              className="hidden hide"
              accept="image/gif, image/jpeg, image/png"
              onChange={this.handleselectedFile}
            />

            <label htmlFor="image_select" className="image_selector">
              {this.state.image_path ? (
                <img className="img-fluid" src={this.state.image_path} />
              ) : (
                <img className="img-fluid" src="/imgs/box_pic_2.png" />
              )}
            </label>
          </div>
        </div>
      </form>
    );
  }

  renderStep2() {
    return (
      <form
        className="row setup-content"
        id="step-2"
        onSubmit={this.submitStep2.bind(this)}
      >
        <div className="col-md-12">
          <div className="row">
            <div className="col-sm-3">
              <ul className="nav nav-tabs tabs-left" role="tablist">
                <li role="presentation">
                  <button
                    type="button"
                    onClick={() => {
                      this.setState({
                        mode: 'free'
                      });
                    }}
                    className={this.state.mode == 'free' ? 'active' : ''}
                    href="#home"
                    aria-controls="home"
                    role="tab"
                    data-toggle="tab"
                  >
                    <i className="fas fa-gift" />{' '}
                    <Translate id="home_free_heading" />
                  </button>
                </li>
                <li role="presentation">
                  <button
                    type="button"
                    onClick={() => {
                      this.setState({
                        mode: 'paid'
                      });
                    }}
                    aria-controls="profile"
                    role="tab"
                    className={this.state.mode == 'paid' ? 'active' : ''}
                    data-toggle="tab"
                  >
                    <i className="fa fa-credit-card" aria-hidden="true" />{' '}
                    <Translate id="home_premium_heading" />
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-sm-9">
              <div className="tab-content">
                {this.state.mode == 'free' ? (
                  <div role="tabpanel" className="tab-pane active" id="home">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="contnet_box_border">
                          <strong>
                            <Translate id="order_free_heading" />
                          </strong>
                          <br />
                          <Translate id="order_free_text_1" />
                          <hr />
                          <Translate id="order_free_text_2" />
                          <hr />
                          <div className="more_preimum">
                            <i className="fas fa-credit-card" />{' '}
                            <Translate id="order_free_upgrade_text" />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="contnet_box_border">
                          <strong>
                            <Translate id="order_my_selection" />
                          </strong>
                          <hr />
                          Free
                          <button
                            className="btn btn-primary nextBtn btn-lg pull-right"
                            type="submit"
                          >
                            <Translate id="order_confirm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div role="tabpanel" className="tab-pane active" id="profile">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="contnet_box_border">
                          <strong>
                            <Translate id="order_premium_heading" />
                          </strong>
                          <br />
                          <Translate id="order_premium_text_1" />
                          <hr />
                          <Translate id="order_premium_text_2" />
                          <hr />
                          <div className="form-group">
                            <label className="control-label">
                              <strong>
                                <Translate id="order_jury_criteria" />
                              </strong>
                            </label>
                          </div>
                          <div className="form-group">
                            <label className="control-label">
                              <Translate id="order_jury_count" />
                              <span className="required">*</span>
                            </label>
                            <select
                              className="form-control"
                              required
                              name="jury_size"
                              onChange={this.handleChange.bind(this)}
                              id="jury_size"
                              value={this.state.jury_size}
                            >
                              <option value="">Select</option>
                              {this.state.plans.map((p, i) => {
                                return (
                                  <option key={p.id} value={p.id}>
                                    {'' +
                                      p.jury_count +
                                      ' ( ' +
                                      p.plan_name +
                                      ' - $' +
                                      p.cost +
                                      ' )'}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="control-label">
                              <Translate id="order_gender_label" />{' '}
                              <span className="required">*</span>
                            </label>
                            <select
                              className="form-control"
                              required
                              name="jury_kind"
                              onChange={this.handleChange.bind(this)}
                              id="jury_kind"
                              value={this.state.jury_kind}
                            >
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="control-label">
                              <Translate id="order_age_label" />{' '}
                              <span className="required">*</span>
                            </label>
                            <select
                              className="form-control"
                              required
                              name="jury_age"
                              onChange={this.handleChange.bind(this)}
                              id="jury_age"
                              value={this.state.jury_age}
                            >
                              <option value="">Select</option>
                              <option value="18-25">18-25</option>
                              <option value="25-35">25-35</option>
                              <option value="35-45">35-45</option>
                              <option value="45-55">45-55</option>
                              <option value="55-65">55-65</option>
                              <option value="65+">65+</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="contnet_box_border">
                          <strong>
                            <Translate id="order_my_selection" />
                          </strong>
                          <hr />
                          Premium
                          <button
                            disabled={
                              !this.state.jury_age ||
                              !this.state.jury_kind ||
                              !this.state.jury_size
                            }
                            className="btn btn-primary nextBtn btn-lg pull-right"
                            type="submit"
                          >
                            <Translate id="order_confirm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  renderStep3() {
    const btn_label = this.state.clicked
      ? 'please wait...'
      : 'Complete purchase';
    return (
      <div className="card-block">
        <form onSubmit={this.handleCheckoutStep3.bind(this)}>
          <legend>
            <Translate id="order_checkout" />
          </legend>
          <Messages messages={this.props.messages} />
          <div className="form-group row m-t-2">
            <label
              htmlFor="name_on_card"
              className="col-sm-3 form-control-label"
            >
              <Translate id="order_name_on_card" />
            </label>
            <div className="col-sm-7">
              <input
                type="text"
                required
                autoFocus
                name="name_on_card"
                id="name_on_card"
                className="form-control"
                value={this.state.billing.name_on_card}
                onChange={this.handleChange.bind(this)}
              />
            </div>
          </div>
          <div className="form-group row">
            <label
              htmlFor="card_number"
              className="col-sm-3 form-control-label"
            >
              <Translate id="order_card" />
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
          <div className="row">
            <div className="col-sm-12 text-xs-center" />
          </div>
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
      </div>
    );
  }

  renderStep4() {
    return (
      <div className="row setup-content center_content" id="step-4">
        <div className="row">
          <div className="col-md-12">
            <div className="info_result">
              <p>
                <Translate id="order_success_text" />
              </p>

              <p>
                <Translate id="order_success_text_2" />
                <Link to="/results">
                  <Translate id="order_dsahboard_link_text" />
                </Link>
              </p>

              <p>
                <Link to="/vote">
                  <Translate id="order_meanwhile_vote_text" />
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  showCurrentStep() {
    if (this.state.current_step == 1) {
      return this.renderStep1();
    } else if (this.state.current_step == 2) {
      return this.renderStep2();
    } else if (this.state.current_step == 3) {
      return this.renderStep3();
    } else if (this.state.current_step == 4) {
      return this.renderStep4();
    }
  }

  render() {
    // console.log(this.props);
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h2 className="title_heading">Order</h2>
              </div>
            </div>
          </div>
        </section>

        <section className="m-b-50">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="stepwizard">
                  <div className="stepwizard-row setup-panel">
                    <div className="stepwizard-step">
                      <button
                        onClick={() => {
                          if (
                            this.state.current_step > 1 &&
                            this.state.backAllowed
                          ) {
                            this.setState({current_step: 1});
                          }
                        }}
                        type="button"
                        className={
                          'btn btn-circle ' +
                          (this.state.current_step == 1
                            ? 'btn-primary'
                            : 'btn-default')
                        }
                      >
                        <i className="fa fa-camera-alt" aria-hidden="true" />
                      </button>
                      <p>
                        <Translate id="order_step_1_heading" />{' '}
                        <small>
                          <Translate id="order_step_1_subheading" />
                        </small>
                      </p>
                    </div>
                    <div className="stepwizard-step">
                      <button
                        onClick={() => {
                          if (
                            this.state.current_step > 2 &&
                            this.state.backAllowed
                          ) {
                            this.setState({current_step: 2});
                          }
                        }}
                        type="button"
                        className={
                          'btn btn-circle ' +
                          (this.state.current_step == 2
                            ? 'btn-primary'
                            : 'btn-default')
                        }
                      >
                        <i className="fa fa-cogs" aria-hidden="true" />
                      </button>
                      <p>
                        <Translate id="order_step_2_heading" />{' '}
                        <small>
                          <Translate id="order_step_2_subheading" />
                        </small>
                      </p>
                    </div>
                    <div className="stepwizard-step">
                      <button
                        onClick={() => {
                          if (
                            this.state.current_step > 3 &&
                            this.state.backAllowed
                          ) {
                            this.setState({current_step: 3});
                          }
                        }}
                        type="button"
                        className={
                          'btn btn-circle ' +
                          (this.state.current_step == 3
                            ? 'btn-primary'
                            : 'btn-default')
                        }
                      >
                        <i
                          className="fa fa-credit-card-alt"
                          aria-hidden="true"
                        />
                      </button>
                      <p>
                        <Translate id="order_step_3_heading" />{' '}
                        <small>
                          <Translate id="order_step_3_subheading" />
                        </small>
                      </p>
                    </div>
                    <div className="stepwizard-step">
                      <button
                        type="button"
                        className={
                          'btn btn-circle ' +
                          (this.state.current_step == 4
                            ? 'btn-primary'
                            : 'btn-default')
                        }
                      >
                        <i className="fas fa-chart-area" />
                      </button>
                      <p>
                        <Translate id="order_step_4_heading" />{' '}
                        <small>
                          <Translate id="order_step_4_subheading" />
                        </small>
                      </p>
                    </div>
                  </div>
                </div>

                {this.showCurrentStep()}
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
    user: state.auth.user,
    token: state.auth.token,
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Order);
