import React from 'react';
import {connect} from 'react-redux';
import {transfer} from '../../../../actions/stripe';
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
    let cost = credits_to_buy;
    switch(parseInt(points_to_add))
    {
      case 1:
        cost = 1;
        break;
      case 5:
        cost = 3.75;
        break;
      case 10:
        cost = 7.50;
        break;
      case 25:
        cost = 18.75;
        break;
      case 50:
        cost = 37.50;
        break;
      case 100:
        cost = 75;
        break;
      default:
        cost = points_to_add;
    }
    this.openBuyPopup('credits_box', 'Buy Credits', cost, {
      points: credits_to_buy,
      show_amount : cost,
      type: 'credit'
    });
  }

  handleTransferSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('handleTransferSubmit');

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
    this.setState({
      transfer_processing: true
    });
    this.props.dispatch(
      transfer(
        {
          amount_to_transfer: this.state.amount_to_transfer,
          username_to_transfer: this.state.username_to_transfer
        },
        st => {
          scrollToTop();
          setTimeout(() => {
            this.setState({
              init_transaction_mode: false,
              prev_success_type: 'transfer',
              transfer_processing: false
            });
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
          <div className=" col-12 col-md m-2">
            <button
              type="button"
              disabled={this.props.disabled}
              className="btn btn-primary m-0 width-100"
              onClick={this.initAdd.bind(this)}
            >
              Add Credits
            </button>
          </div>
          <div className=" col-12 col-md m-2 width-100">
            <button
              type="button"
              disabled={this.props.disabled || user.credit_balance <= 0}
              className="btn btn-primary m-0"
              onClick={this.initTransfer.bind(this)}
            >
              Transfer
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
          <select
            size="1"
            type="number"
            id="add_new_bal_number"
            placeholder={'Add Credit Points'}
            className="form-control "
            name="add_new_bal_number"
            value={this.state.add_new_bal_number}
            onChange={this.handleChange.bind(this)}
          >
            <option value="">Add Credits</option>
            <option value="1">1 credit for $1</option>
            <option value="5">5 credits for $3.75</option>
            <option value="10">10 credits for $7.50</option>
            <option value="25">25 credits for $18.75</option>
            <option value="50">50 credits for $37.50</option>
            <option value="100">100 credits for $75</option>
          </select>

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

  renderTransfer() {
    if (this.state.showing != 'transfer') {
      return false;
    }
    return (
      <div className="row">
        <div className="col-md-12">
          <hr />
          <div className="contnet_box_border">
            <form
              id="handleTransferSubmit"
              noValidate
              onSubmit={this.handleTransferSubmit.bind(this)}
              className="field_form needs-validation"
            >
              <div className="form-group m-t-2">
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
                    placeholder="Username to transfer to"
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
                    min="1"
                    required
                    max={this.props.user ? this.props.user.credit_balance : 0}
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
                  value={
                    this.state.transfer_processing
                      ? 'Please wait..'
                      : 'Transfer'
                  }
                  disabled={
                    !this.state.amount_to_transfer ||
                    !this.state.username_to_transfer ||
                    this.state.transfer_processing ||
                    parseInt(this.state.amount_to_transfer) < 1
                  }
                  className="btn btn-primary"
                />
                <small>Minimum amount: 1 credits</small>
              </div>
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
        <div className="authorize_box shadow">
          <div className="credit_summary ">
            Credit Balance
            <br />
            <img className="shop_img" src="/assets/icons/coin-01.png" />
            <br /> {user.credit_balance}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          {this.renderActions()}
          {this.renderTransfer()}
          {this.renderAddForm()}
          {/*this.state.init_transaction_mode == 'credit' ? (
            this.renderBuyBox('credit')
          ) : this.state.init_transaction_mode == 'transfer' ? (
            this.renderTransferBox('transfer')
          ) : (

          )*/}
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
