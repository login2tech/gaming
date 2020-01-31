import React from 'react';
import {connect} from 'react-redux';
import {openBuyPopup, token_received} from './Common';
import {activate_doublexp_token} from '../../../../actions/stripe';
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

  // initAdd() {
  //   this.setState({showing: 'add_form'});
  //   this.props.dispatch({
  //     type: 'CLR_MSG'
  //   });
  // }

  // initTransfer() {
  //   this.setState({showing: 'transfer'});
  //   this.props.dispatch({
  //     type: 'CLR_MSG'
  //   });
  // }

  submitInitForm(e) {
    e.preventDefault();
    this.openBuyPopup('double_xp', 'Buy Double XP Token', 2, {
      points: 2,
      type: 'double_xp'
    });
  }

  activateDoubleXP() {
    this.props.dispatch(
      activate_doublexp_token(
        {},

        st => {
          scrollToTop();
          this.setState({
            // init_transaction_mode: false,
            // prev_success_type: 'withdraw'
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      )
    );
  }

  initActivate() {
    this.setState({
      showing: 'activate'
    });
  }

  renderActivate() {
    if (this.state.showing != 'activate') {
      return false;
    }
    return (
      <div className=" text-center  mt-3">
        <p>Are you sure?</p>
        <div className="row no-gutters" role="group" aria-label="Basic example">
          <div className=" col-12 col-md m-2">
            <button
              type="button"
              className="btn btn-primary m-0 width-100"
              onClick={this.activateDoubleXP.bind(this)}
            >
              Yes
            </button>
          </div>
          <div className=" col-12 col-md m-2 width-100">
            <button
              type="button"
              className="btn btn-danger m-0 width-100"
              onClick={() => {
                this.setState({
                  showing: 'actions'
                });
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderActions() {
    const {user} = this.props;
    if (this.state.showing != 'actions') {
      return false;
    }
    return (
      <div className=" text-center  mt-3">
        <div className="row no-gutters" role="group" aria-label="Basic example">
          <div className=" col-12 col-md m-2">
            <button
              type="button"
              className="btn btn-primary m-0 width-100"
              onClick={this.submitInitForm.bind(this)}
            >
              Buy Tokens
            </button>
          </div>
          <div className=" col-12 col-md m-2 width-100">
            <button
              type="button"
              disabled={user.double_xp_tokens < 1}
              className="btn btn-primary m-0"
              onClick={this.initActivate.bind(this)}
            >
              Activate token
            </button>
          </div>
        </div>
      </div>
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
              onSubmit={this.handleTransferSubmit.bind(this)}
              className="field_form"
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
  render() {
    const {user} = this.props;
    return (
      <div className={this.props.class}>
        <div className="authorize_box shop text-center">
          <div className="credit_summary ">
            Double XP <br />
            <img src="/assets/icons/coin-02.png" className="shop_img" />
            <br /> $2 / 24 hours <br />
            You have {user.double_xp_tokens} tokens
          </div>

          {this.renderActions()}
          {this.renderTransfer()}
          {this.renderActivate()}
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
