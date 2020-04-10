import React from 'react';
import {connect} from 'react-redux';
import CreditsBox from './BuyBoxes/CreditsBox';
import CashBox from './BuyBoxes/CashBox';
import DoubleXPBox from './BuyBoxes/DoubleXPBox';
class MyBankModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user_teams: []};
  }

  render() {
    return (
      <div className="tab-pane  text-center" data-tab="tab3">
        <div className="row mb-3">
          <CreditsBox

            disabled={
              this.props.user && (
                this.props.user.state == 'Arizona' ||
                this.props.user.state == 'Connecticut' ||
                this.props.user.state == 'Iowa' 
              )
            }
             class="col-md-6"
          />
          <CashBox

            disabled={
              this.props.user && (
                this.props.user.state == 'Arizona' ||
                this.props.user.state == 'Connecticut' ||
                this.props.user.state == 'Iowa' 
              )
            }
             class="col-md-6"
          />
        </div>
        <div className="row">
          <DoubleXPBox

            disabled={
              this.props.user && (
                this.props.user.state == 'Arizona' ||
                this.props.user.state == 'Connecticut' ||
                this.props.user.state == 'Iowa' 
              )
            }
             class="col-md-6  offset-md-3"
          />
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

export default connect(mapStateToProps)(MyBankModule);
