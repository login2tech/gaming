import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import moment from 'moment';

import React from 'react';
class MoreInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'mode_info'
      })
    );
  }

  render() {
    const {data} = this.props;
    // console.log(data);
    return (
      <div className="">
        <div>
          <div className="modal-body report_left_inner more_info_de">
            <table className="table table-stripped">
            <tbody>
            <tr><td>Id</td><td>{data.id}</td></tr>
            <tr><td>First_name</td><td>{data.first_name}</td></tr>
            <tr><td>Last_name</td><td>{data.last_name}</td></tr>
            <tr><td>Email</td><td>{data.email}</td></tr>
            <tr><td>Profile_views</td><td>{data.profile_views}</td></tr>
            <tr><td>Username</td><td>{data.username}</td></tr>
            <tr><td>Email_verified</td><td>{data.email_verified}</td></tr>
            <tr><td>Created at</td><td>{moment(data.created_at).format('lll')}</td></tr>
            <tr><td>Gender</td><td>{data.gender}</td></tr>
            <tr><td>Cover Picture</td><td><img src={data.cover_picture} width="100px" height="100px" /></td></tr>
            <tr><td>Picture</td><td><img src={data.picture} width="100px" height="100px" /></td></tr>
            <tr><td>Profile_picture</td><td><img src={data.profile_picture} width="100px" height="100px" /></td></tr>
            <tr><td>Stripe_user_id</td><td>{data.stripe_user_id}</td></tr>
            <tr><td>Status</td><td>{data.status}</td></tr>
            <tr><td>Credit_balance</td><td>{data.credit_balance}</td></tr>
            <tr><td>Cash_balance</td><td>{data.cash_balance}</td></tr>
            <tr><td>Life_earning</td><td>{data.life_earning}</td></tr>
            <tr><td>Role</td><td>{data.role}</td></tr>
            <tr><td>Life_xp</td><td>{data.life_xp}</td></tr>
            <tr><td>Wins</td><td>{data.wins}</td></tr>
            <tr><td>Loss</td><td>{data.loss}</td></tr>

            <tr><td>Dob</td><td>{data.dob}</td></tr>
            <tr><td>Double_xp</td><td>{data.double_xp}</td></tr>
            <tr><td>Prime</td><td>{data.prime}</td></tr>
            <tr><td>Xp_rank</td><td>{data.xp_rank}</td></tr>
            <tr><td>Timezone</td><td>{data.timezone}</td></tr>

            <tr><td>Gamer_tag_1</td><td>{data.gamer_tag_1}</td></tr>
            <tr><td>Gamer_tag_2</td><td>{data.gamer_tag_2}</td></tr>
            <tr><td>Gamer_tag_3</td><td>{data.gamer_tag_3}</td></tr>
            <tr><td>Gamer_tag_4</td><td>{data.gamer_tag_4}</td></tr>
            <tr><td>Gamer_tag_5</td><td>{data.gamer_tag_5}</td></tr>
            <tr><td>Gamer_tag_6</td><td>{data.gamer_tag_6}</td></tr>


             
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    modals: state.modals.modals,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(MoreInfo);
