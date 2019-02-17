import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {login} from '../../actions/auth';
// import {facebookLogin} from '../../actions/oauth';
import Messages from '../Modules/Messages';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {email: '', password: ''};
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.dispatch(login(this.state.email, this.state.password));
  }

  // handleFacebook() {
  //   this.props.dispatch(facebookLogin(this.props.settings.facebook_public_key));
  // }
  //
  // componentDidMount() {
  //   document.body.classList.add('bg_login');
  //   document.body.classList.add('align');
  // }
  //
  // componentWillUnmount() {
  //   document.body.classList.remove('bg_login');
  //   document.body.classList.remove('align');
  // }

  render() {
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="authorize_box">
                <div className="title_default_dark title_border text-center">
                  <h4>Login</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form onSubmit={this.handleLogin.bind(this)}>
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
                    <div className="form-group col-md-12">
                      <input
                        type="password"
                        className="form-control"
                        required=""
                        placeholder="Enter Password"
                        name="password"
                        id="password"
                        value={this.state.password}
                        onChange={this.handleChange.bind(this)}
                      />
                    </div>
                    <div className="form-group col-md-12 text-center">
                      <button
                        className="btn btn-default bttn_submit"
                        type="submit"
                      >
                        Login
                      </button>
                    </div>
                    <div className="form-group col-md-12 text-center">
                      <Link to="/forgot" class="forgot_pass">
                        Forgot Password?
                      </Link>
                    </div>
                  </form>
                </div>

                <div className="create_account_link">
                  <Link to="/signup">
                    Create your Account{' '}
                    <i
                      className="fa fa-long-arrow-right m-l-5"
                      aria-hidden="true"
                    />
                  </Link>
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
    messages: state.messages,
    settings: state.settings
  };
};

export default connect(mapStateToProps)(Login);
