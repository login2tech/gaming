import React from 'react';
import {connect} from 'react-redux';
import {buy_membership} from '../../../actions/stripe';
import {openModal, closeModal} from '../../../actions/modals';
import PaymentModal from '../../Modules/Modals/PaymentModal';
import moment from 'moment';
const plan_prices = {
  gold: 6.99,
  silver: 4.99
};
import Messages from '../../Modules/Messages';
import {Link} from 'react-router';

class MyMembershipModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user_teams: []};
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({[event.target.name]: event.target.value});
  }

  processMembership(plan) {
    const price = plan_prices[plan];
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'membership_popup',
        zIndex: 534,
        heading: 'Buy OCG ' + plan + ' Membership',
        content: (
          <PaymentModal
            msg=""
            msg_footer={
              <ul className="notices">
                <li>
                  - OCG Memberships are automatically renewed each month at the
                  end of your subscription cycle.
                </li>
                <li>- You can stop renewal from "My Bank" page.</li>
                <li>
                  - Membership bought via OCG cash will be renewed only if you
                  have sufficient OCG cash in your bank.
                </li>
              </ul>
            }
            amount={price}
            returnDataToEvent={plan}
            // refresh={props.refresh}
            onGetToken={(token, plan_name) => {
              this.token_received(token, plan_name);
            }}
          />
        )
      })
    );
  }

  token_received(token, plan_name) {
    if (token != 'USE_OCG') {
      token = token.id;
    }
    this.props.dispatch(
      buy_membership(
        {
          stripe_token: token,
          plan: plan_name
        },
        cb => {
          this.props.dispatch(
            closeModal({
              id: 'membership_popup'
            })
          );
          if (cb) {
            // do on success
          }
        }
      )
    );
  }

  render() {
    let prime_obj = this.props.user.prime_obj;
    if (this.props.user.prime) {
      if (!prime_obj) {
        prime_obj = '{}';
      }
      prime_obj = JSON.parse(prime_obj);
    }

    return (
      <div className="tab-pane  text-center" data-tab="tab3">
        <Messages messages={this.props.messages} />
        <div className="row shop_row" style={{marginBottom: '20px'}}>
          <div className="col-md-6">
            <div className="authorize_box shop text-center">
              <div className="credit_summary ">
                Official Comp Membership
                <br />
                <span className="text-lg text-gold">Gold</span>
                <br />
                <img
                  src="/assets/icons/ocg_member_gold.png"
                  style={{
                    height: '150px',
                    marginTop: '20px',
                    marginBottom: '20px'
                  }}
                />
                <br /> $6.99 / month
                <br />
                <div className="lstitm">
                  <span className="text-primary">
                    ONLY COMP OFICIAL PREMIUM RANK SYSTEM (FREE-REWARDS!!)
                  </span>
                  <span>Premium ticket support</span>
                  <span>
                    Compete in “official Comp Member tournaments” for free!
                  </span>
                  <span>High priority Cash Withdrawals </span>
                  <span>Free Cash Out Matches non charge 10% for each 1$</span>
                  <span>1 Free @username change!</span>
                  <span>Match Escalations </span>
                  <span>3 Free 24 Hour Double (XP) Token!</span>
                  <span>10 Free Credits!</span>
                </div>
              </div>
              <div className="row">
                <div className="col-md-8 offset-md-2 text-center">
                  {this.props.user ? (
                    this.props.user.prime ? (
                      <>
                        <p className="text-success">
                          You are already a Official Comp {prime_obj.prime_type}{' '}
                          Member
                        </p>
                        <strong>Started on: </strong>
                        {moment(prime_obj.starts_on).format('LLL')}
                        <br />

                        <strong>Next Renewal on: </strong>
                        {moment(prime_obj.next_renew).format('LLL')}
                      </>
                    ) : (
                      <input
                        type="submit"
                        value="Buy Official Comp Gold Membership"
                        onClick={() => {
                          this.processMembership('gold');
                        }}
                        className="btn btn-default bttn_submit"
                      />
                    )
                  ) : (
                    <Link to="/login" className="btn btn-default bttn_submit">
                      Get Official Comp Gold Membership
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="authorize_box shop text-center">
              <div className="credit_summary ">
                Official Comp Membership
                <br />
                <span className="text-lg text-silver">Silver</span>
                <br />
                <img
                  src="/assets/icons/ocg_member_silver.png"
                  style={{
                    height: '150px',
                    marginTop: '20px',
                    marginBottom: '20px'
                  }}
                />
                <br /> $4.99 / month
                <div className="lstitm">
                  <span className="text-primary">
                    ONLY COMP OFICIAL PREMIUM RANK SYSTEM (FREE-REWARDS!!)
                  </span>
                  <span>Premium ticket support</span>
                  <span>
                    Compete in “official Comp Member tournaments” for free!
                  </span>
                  <span>High priority Cash Withdrawals </span>
                  <span>
                    Free Cash Out Matches non charge 10% for each $1 earned{' '}
                  </span>
                  {/*<span>1 Free @username change!</span>*/}
                  <span>Match Escalations </span>
                  <span>1 Free 24 Hour Double (XP) Token!</span>
                  <span className="no-ico" />
                  <span className="no-ico" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-8 offset-md-2 text-center">
                  {this.props.user ? (
                    this.props.user.prime ? (
                      <p className="text-success">
                        You are already a Official Comp Member
                      </p>
                    ) : (
                      <input
                        type="submit"
                        value="Buy Official Comp Silver Membership"
                        onClick={() => {
                          this.processMembership('silver');
                        }}
                        className="btn btn-default bttn_submit"
                      />
                    )
                  ) : (
                    <Link to="/login" className="btn btn-default bttn_submit">
                      Get Official Comp Silver Membership
                    </Link>
                  )}
                </div>
              </div>
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

export default connect(mapStateToProps)(MyMembershipModule);
