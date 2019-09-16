import React from 'react';
import {connect} from 'react-redux';
import {updateProfile, changePassword, deleteAccount} from '../../actions/auth';
import Messages from '../Messages';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      gender: ''
    };
    // console.log(props);
    // this.state = {
    //   email: props.user.email,
    //   name: props.user.name,
    //   gender: props.user.gender,
    //   password: '',
    //   confirm: ''
    // };
  }
  componentDidMount() {
    // console.log(this.props.user);
    this.setState({
      email: this.props.user.email,
      name: this.props.user.name,
      gender: this.props.user.gender,
      password: '',
      confirm: ''
    });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleProfileUpdate(event) {
    event.preventDefault();
    this.props.dispatch(updateProfile(this.state, this.props.token));
  }

  handleChangePassword(event) {
    event.preventDefault();
    this.props.dispatch(
      changePassword(this.state.password, this.state.confirm, this.props.token)
    );
  }

  handleDeleteAccount(event) {
    event.preventDefault();
    this.props.dispatch(deleteAccount(this.props.token));
  }

  render() {
    return (
      <div className="container">
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <form
              onSubmit={this.handleProfileUpdate.bind(this)}
              className="form-horizontal"
            >
              <legend>Profile Information</legend>
              <div className="form-group">
                <label htmlFor="email" className="col-sm-3">
                  Email
                </label>
                <div className="col-sm-7">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    value={this.state.email}
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="name" className="col-sm-3">
                  Name
                </label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="form-control"
                    value={this.state.name}
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="col-sm-offset-3 col-sm-4">
                  <button type="submit" className="btn btn-success">
                    Update Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <form
              onSubmit={this.handleChangePassword.bind(this)}
              className="form-horizontal"
            >
              <legend>Change Password</legend>
              <div className="form-group">
                <label htmlFor="password" className="col-sm-3">
                  New Password
                </label>
                <div className="col-sm-7">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="form-control"
                    value={this.state.password}
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirm" className="col-sm-3">
                  Confirm Password
                </label>
                <div className="col-sm-7">
                  <input
                    type="password"
                    name="confirm"
                    id="confirm"
                    className="form-control"
                    value={this.state.confirm}
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="col-sm-4 col-sm-offset-3">
                  <button type="submit" className="btn btn-success">
                    Change Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Profile);
