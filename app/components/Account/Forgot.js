import React from 'react';
import {connect} from 'react-redux';
import {forgotPassword} from '../../actions/auth';
import Messages from '../Modules/Messages';
import {Link} from 'react-router';

class Forgot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {email: ''};
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleForgot(event) {
    event.preventDefault();
    this.props.dispatch(forgotPassword(this.state.email));
  }

  render() {
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="authorize_box">
                <div className="title_default_dark title_border text-center">
                  <h4>Reset Password</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form onSubmit={this.handleForgot.bind(this)}>
                    <div className="form-group col-md-12">
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        required=""
                        placeholder="Enter Email"
                        name="email"
                        value={this.state.email}
                        onChange={this.handleChange.bind(this)}
                      />
                    </div>

                    <div className="form-group col-md-12 text-center">
                      <button
                        className="btn btn-default bttn_submit"
                        type="submit"
                      >
                        Send Password Link
                      </button>
                    </div>
                    <div className="form-group col-md-12 text-center">
                      <Link to="/login" className="forgot_pass">
                        Login instead{' '}
                        <i
                          className="fa fa-long-arrow-right m-l-5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = state => {
  return {
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Forgot);
