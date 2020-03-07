import React from 'react';
import {connect} from 'react-redux';
import {withdraw} from '../../../../actions/stripe';
import {openBuyPopup, token_received} from './Common';
// import Messages from '../../../Modules/Messages';
// import moment from 'moment';
// import PaymentModal from '../../../Modules/Modals/PaymentModal';
// import {openModal, closeModal} from '../../../../actions/modals';
// import CommonFuncs from './Common';
// import {Link} from 'react-router';
class Credits extends React.Component {
  state = {
    showing: 'actions'
  };

  constructor(props) {
    super(props);
    this.openBuyPopup = openBuyPopup.bind(this);
    this.token_received = token_received.bind(this);
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({[event.target.name]: event.target.value});
  }

  initAdd() {
    this.setState({showing: 'add_form'});
    this.props.dispatch({
      type: 'CLR_MSG'
    });
  }

  initTransfer() {
    this.setState({showing: 'transfer'});
    this.props.dispatch({
      type: 'CLR_MSG'
    });
  }

  submitInitForm(e) {
    e.preventDefault();
    if (!this.state.add_new_bal_number) {
      return false;
    }
    const credits_to_buy = this.state.add_new_bal_number;
    this.openBuyPopup(
      'cash_box',
      'Buy OCG Cash',
      credits_to_buy,
      {
        points: credits_to_buy,
        type: 'cash'
      },
      true
    );
  }

  withdrawFormSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('withdrawFormSubmit');
    form.classList.add('was-validated');
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    this.props.dispatch(
      withdraw(
        {
          amount_to_withdraw: this.state.amount_to_withdraw,
          withdraw_method: this.state.withdraw_method,
          withdraw_path: this.state.withdraw_path
        },

        st => {
          scrollToTop();
          this.setState({
            init_transaction_mode: false,
            prev_success_type: 'withdraw'
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      )
    );
  }

  renderActions() {
    const {user} = this.props;
    if (this.state.showing != 'actions') {
      return false;
    }
    return (
      <div className="text-center mt-3">
        <div className="row no-gutters" role="group" aria-label="Basic example">
          <div className="  col-12 col-md m-2 lpb">
            <button
              type="button"
              className="btn btn-primary m-0 width-100"
              onClick={this.initAdd.bind(this)}
            >
              Deposit OCG Cash
            </button>
          </div>
          <div className="    col-12 col-md m-2 lpb">
            <button
              type="button"
              disabled={user.cash_balance <= 0.1}
              className="btn btn-primary m-0  width-100"
              onClick={this.initTransfer.bind(this)}
            >
              Withdraw OCG Cash
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderAddForm() {
    //add_form
    // const {user} = this.props;
    if (this.state.showing != 'add_form') {
      return false;
    }
    return (
      <form
        className="text-center field_form  mt-3"
        onSubmit={this.submitInitForm.bind(this)}
      >
        <div className="input-group mb-3  m-2">
          <input
            type="number"
            min="5"
            id="add_new_bal_number"
            placeholder={
              this.state.init_transaction_mode == 'credit'
                ? 'Add Credit Points'
                : 'Deposit Cash'
            }
            className="form-control "
            name="add_new_bal_number"
            value={this.state.add_new_bal_number}
            onChange={this.handleChange.bind(this)}
          />
          <div className="input-group-append">
            <button
              className="btn btn-primary m-0 width-100"
              disabled={
                this.state.add_new_bal_number == '' ||
                this.state.add_new_bal_number == 0
              }
              type="submit"
              id="button-addon2"
            >
              Buy Now
            </button>
          </div>
        </div>
      </form>
    );
  }

  renderWithdraw() {
    if (this.state.showing != 'transfer') {
      return false;
    }
    return (
      <div className="row">
        <div className="col-md-12">
          <hr />
          <div className="contnet_box_border">
            <form
              id="withdrawFormSubmit"
              onSubmit={this.withdrawFormSubmit.bind(this)}
              noValidate
              className="field_form needs-validation"
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
                  step="0.1"
                  max={this.props.user.cash_balance}
                  required
                  autoFocus
                  name="amount_to_withdraw"
                  placeholder=""
                  id="amount_to_withdraw"
                  className="form-control text-black m-0"
                  value={this.state.amount_to_withdraw}
                  onChange={this.handleChange.bind(this)}
                />
                <div className="invalid-feedback">
                  Amount must be more than or equal to $1.00
                </div>
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
                value="Withdraw OCG Cash"
                className="btn btn-primary"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {user} = this.props;
    return (
      <div className={this.props.class}>
        <div className="authorize_box shop text-center">
          <div className="credit_summary ">
            OCG Cash Balance
            <br />
            <img src="/assets/icons/money-01.png" className="shop_img" />
            <br /> ${user && user.cash_balance.toFixed(2)}
            <br />
            &nbsp;&nbsp;&nbsp;
          </div>

          {this.renderActions()}
          {this.renderWithdraw()}
          {this.renderAddForm()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    token: state.auth.token
  };
};

export default connect(mapStateToProps)(Credits);
