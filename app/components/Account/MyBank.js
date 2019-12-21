import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import MyBankModule from './Modules/MyBankModule';
import MyMembershipModule from './Modules/MyMembershipModule';
class MyBank extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {records: {}, loaded: false, ladders: {}};
  }

  render() {
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3 className="no-case-change">My Bank</h3>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <MyMembershipModule
                  id={this.props.user.id}
                  user_info={this.props.user}
                />
                <MyBankModule
                  id={this.props.user.id}
                  user_info={this.props.user}
                />
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
    messages: state.messages
  };
};

export default connect(mapStateToProps)(MyBank);
