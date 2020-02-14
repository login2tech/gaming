import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import React from 'react';
class PaymentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stripe_good: false,
      name_on_card: '',
      clicked: false
    };
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: this.props.modal_id ? this.props.modal_id : 'payment'
      })
    );
  }

  componentDidMount() {
    this.handleStripeCreation();
  }

  handleChange(event) {
    // const name = event.target.name;
    this.setState({[event.target.name]: event.target.value}, () => {});
  }

  handleStripeCreation() {
    const stripe_mode = this.props.settings.stripe_mode;
    const key =
      stripe_mode == 'live'
        ? this.props.settings.stripe_live_publishable_key
        : this.props.settings.stripe_test_publishable_key;
    const stripe = Stripe(key);
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
          color: 'red'
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

  proceedWithOCG() {
    this.setState({
      ocg_processing: true
    });
    this.props.onGetToken &&
      this.props.onGetToken(
        'USE_OCG',
        this.props.returnDataToEvent ? this.props.returnDataToEvent : {}
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
      this.props.onGetToken &&
        this.props.onGetToken(
          result.token,
          this.props.returnDataToEvent ? this.props.returnDataToEvent : {}
        );
      this.setState({
        token_processing: false
      });
    } else if (result.error) {
      errorElement.textContent = result.error.message;
      errorElement.classList.add('visible');
      this.setState({clicked: false, stripe_good: false});
    } else {
      errorElement.textContent = '';
      this.setState({clicked: false, stripe_good: true});
      errorElement.classList.remove('visible');
    }
  }

  handleCheckout(event) {
    //const tmp_this = this;
    this.setState({clicked: true, token_processing: true});
    event.preventDefault();

    const extraDetails = {
      name: this.state.name_on_card
    };
    this.stripe
      .createToken(this.cardObj, extraDetails)
      .then(this.setOutcome.bind(this));
  }

  render() {
    // const {data} = this.props;
    const amount_pending = this.props.amount;
    // parseFloat(data.invoice_amount ? data.invoice_amount : 0) -
    // parseFloat(data.paid_offline ? data.paid_offline : 0);

    return (
      <div className="">
        <form onSubmit={this.handleCheckout.bind(this)} className="field_form">
          {!this.state.clicked ? (
            false
          ) : (
            <div className="show_loader">
              <div className="is_loader" />
            </div>
          )}
          <div className="modal-body">
            <p>{this.props.msg}</p>
            <p>
              <strong>Amount:</strong> ${amount_pending} + $
              {((amount_pending * 3) / 100).toFixed(2)} Service Charge
            </p>
            <div className="form-group">
              <label htmlFor="name_on_card" className="  form-control-label  ">
                Name on Card:
              </label>
              <input
                type="text"
                className="form-control"
                id="name_on_card"
                value={this.state.name_on_card}
                name="name_on_card"
                onChange={this.handleChange.bind(this)}
              />
            </div>
            <div className="form-group row">
              <div className="col-sm-12">
                <label htmlFor="card_number" className="  form-control-label  ">
                  Card Number:
                </label>
                <br />
                <div id="card-errors" role="alert" />
                <div id="cardElement" />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-sm-2"> </div>
              <div className="col-sm-8 text-center">
                <div
                  className="outcome_error text-center text-danger"
                  role="alert"
                />
                <div className="outcome_success text-center  text-success">
                  <div className="token" />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{display: 'block'}}>
            <div>
              <div className="d-flex d-flex_i">
                <button
                  type="button"
                  onClick={() => this.doClose()}
                  className="btn text-white"
                  tabIndex="30"
                  data-dismiss="modal"
                >
                  cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !this.state.stripe_good || this.state.token_processing
                  }
                  className="btn btn-cta btn-outline btn-post btn-primary"
                >
                  {this.state.token_processing
                    ? 'please wait...'
                    : this.props.button_title
                      ? this.props.button_title
                      : 'Pay and proceed'}
                </button>
              </div>
              <div className="text-center mt-3">
                {this.props.disable_ocg ? (
                  false
                ) : this.state.ocg_proceed == 1 ? (
                  <div className="btn-group">
                    <button
                      onClick={this.proceedWithOCG.bind(this)}
                      type="button"
                      disabled={
                        amount_pending > this.props.user.cash_balance ||
                        this.state.ocg_processing
                      }
                      className="btn text-white  btn-primary"
                    >
                      {this.state.ocg_processing ? 'please wait...' : 'confirm'}
                    </button>
                    <button
                      onClick={() => {
                        this.setState({
                          ocg_proceed: 0
                        });
                      }}
                      type="button"
                      disabled={amount_pending > this.props.user.cash_balance}
                      className="btn text-white  btn-danger"
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      this.setState({
                        ocg_proceed: 1
                      });
                    }}
                    type="button"
                    disabled={amount_pending > this.props.user.cash_balance}
                    className="btn text-white"
                  >
                    Or Proceed with ${amount_pending} OCG Cash
                  </button>
                )}
              </div>
            </div>
            {this.props.msg_footer ? this.props.msg_footer : false}
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    modals: state.modals.modals,
    user: state.auth.user,
    messages: state.messages,
    settings: state.settings
  };
};

export default connect(mapStateToProps)(PaymentModal);
