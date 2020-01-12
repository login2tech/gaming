import React from 'react';
import {connect} from 'react-redux';
import Messages from '../Modules/Messages';
// import {createTeam} from '../../actions/team';
import MyMembershipModule from '../Account/Modules/MyMembershipModule';
import CreditsBox from '../Account/Modules/BuyBoxes/CreditsBox';
import CashBox from '../Account/Modules/BuyBoxes/CashBox';
import DoubleXPBox from '../Account/Modules/BuyBoxes/DoubleXPBox';

class Shop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <section
        className="middle_part_login"
        style={{
          marginTop: 50,
          padding: 0
        }}
      >
        <div className="container-fluid text-center">
          <Messages messages={this.props.messages} />

          <MyMembershipModule
            id={this.props.user ? this.props.user.id : null}
            user_info={this.props.user}
          />

          <div className="row shop_row" style={{marginBottom: '20px'}}>
            <CreditsBox class="col-md-4" />
            <CashBox class="col-md-4" />
            <DoubleXPBox class="col-md-4" />
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
