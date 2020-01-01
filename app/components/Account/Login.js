import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {login} from '../../actions/auth';
import moment from 'moment';
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
    this.props.dispatch(
      login(this.state.email, this.state.password, (reason, dt, un, uid) => {
        this.setState({
          is_banned: true,
          ban_reason: reason,
          ban_date: dt,
          uname_of_ban: un,
          uid_of_ban: uid
        });
      })
    );
  }

  renderBanned() {
    return (
      <>
        <div className="title_default_dark title_border text-center">
          <h4>BANNED</h4>
        </div>
        <div className="field_form authorize_form text-center">
          <p className="text-center">
            You have been banned on {moment(this.state.ban_date).format('llll')}{' '}
            from accessing the portal by admin
          </p>
          <p>
            <strong className="text-blue">Reason for Ban:</strong>{' '}
            {this.state.ban_reason}
          </p>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              this.setState({
                is_banned: false,
                email: '',
                password: ''
              });
            }}
          >
            <span className="fa fa-arrow-left" /> back to login
          </a>{' '}
          |
          <Link
            to={'/support/tickets/create/via/' + this.state.uname_of_ban}
            // onClick={e => {
            //   e.preventDefault();
            //   this.setState({
            //     is_banned: false,
            //     email: '',
            //     password: ''
            //   });
            // }}
          >
            Create Support Ticket <span className="fa fa-arrow-right" />
          </Link>
        </div>
      </>
    );
  }

  renderLogin() {
    return (
      <>
        <div className="title_default_dark title_border text-center">
          <h4>Login</h4>
        </div>
        <div className="field_form authorize_form">
          <Messages messages={this.props.messages} />
          <br />
          <form onSubmit={this.handleLogin.bind(this)}>
            <div className="form-group col-md-12">
              <input
                type="text"
                id="email"
                className="form-control"
                required=""
                placeholder="Enter Email / Username"
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
              <button className="btn btn-default bttn_submit" type="submit">
                Login
              </button>
            </div>
            <div className="form-group col-md-12 text-center">
              <Link to="/forgot" className="forgot_pass">
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>

        <div className="create_account_link">
          <Link to="/signup">
            Create your Account{' '}
            <i className="fa fa-long-arrow-right m-l-5" aria-hidden="true" />
          </Link>
        </div>
      </>
    );
  }

  render() {
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="authorize_box">
                {this.state.is_banned
                  ? this.renderBanned()
                  : this.renderLogin()}
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
