import React from 'react';
import {connect} from 'react-redux';
import {updateProfile, changePassword, deleteAccount} from '../../actions/auth';
import {link, unlink} from '../../actions/oauth';
import Messages from '../Modules/Messages';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.user.email,
      first_name: props.user.first_name,
      last_name: props.user.last_name,
      gender: props.user.gender,
      age: props.user.age,

      password: '',
      confirm: ''
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleProfileUpdate(event) {
    event.preventDefault();
    this.props.dispatch(
      updateProfile(
        {
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          gender: this.state.gender,
          age: this.state.age
        },
        this.props.token
      )
    );
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

  handleLink(provider) {
    this.props.dispatch(
      link(provider, this.props.settings.facebook_public_key)
    );
  }

  handleUnlink(provider) {
    this.props.dispatch(unlink(provider));
  }
  render() {
    return (
      <div>
        <section className="page_title_bar less_padding">
          <div className="container">
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12">
                <div className="game_pic_tournament">
                  <img
                    className="img-fluid profile_pic_outline"
                    src="/images/img.jpg"
                  />
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>KasuaaliTV</h3>
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span>
                          <i className="fa fa-bar-chart" aria-hidden="true" />
                          40,222nd
                        </span>
                        <p>OCG Rank </p>
                      </div>

                      <div className="col-md-4">
                        <span>
                          <i className="fa fa-eye" aria-hidden="true" /> 739
                        </span>
                        <p>Profile Views </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-trophy" aria-hidden="true" />{' '}
                    ACHIEVEMENT
                  </h5>

                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-2 text-center">
                        <span>
                          <img src="/images/shield-gold.png" />
                        </span>
                        <p>Win - 9 </p>
                      </div>

                      <div className="col-md-2 text-center">
                        <span>
                          <img src="/images/shield-silver.png" />
                        </span>
                        <p>Win - 6 </p>
                      </div>

                      <div className="col-md-2 text-center">
                        <span>
                          <img src="/images/shield-bronze.png" />
                        </span>
                        <p>Win - 2 </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-users" aria-hidden="true" /> TEAMS
                  </h5>

                  <ul className="team_list">
                    <li>
                      <a href="#">
                        <img src="/images/game-1.jpg" />
                      </a>
                    </li>

                    <li>
                      <a href="#">
                        <img src="/images/game-2.jpg" />
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-user" aria-hidden="true" /> ABOUT
                  </h5>

                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MEMBER SINCE</span>
                        <p>10/16/18 11:08AM</p>
                      </div>

                      <div className="col-md-4">
                        <span> TIME ZONE </span>
                        <p>12/30/18 2:00PM</p>
                      </div>

                      <div className="col-md-4">
                        <span>LIFETIME EARNINGS</span>
                        <p>12/30/18 2:00PM</p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <span> PROFILE VIEWS</span>
                        <p>436</p>
                      </div>

                      <div className="col-md-4">
                        <span>Rank</span>
                        <p>4541</p>
                      </div>

                      <div className="col-md-4" />
                    </div>
                  </div>
                </div>

                <div className="content_box">
                  <h5 className="prizes_desclaimer">RECORD BY MATCHES</h5>
                  <p>Data Table here</p>
                </div>

                <div className="content_box">
                  <h5 className="prizes_desclaimer">RECENT TOURNAMENTS</h5>

                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        <th>Tournament</th>
                        <th>Tournament Placing</th>
                        <th>Date</th>
                        <th>Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>$500 Guaranteed 2v2 Fortnite: BR (PC/X1/PS4)</td>
                        <td>2nd</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 2v2 Fortnite: BR (X1, PS4, PC)</td>
                        <td>6th</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 2v2 Fortnite: BR (X1, PS4, PC)</td>
                        <td>3rd</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 1v1 Fortnite: BR (X1, PS4, PC)</td>
                        <td>1st</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 1v1 Fortnite: BR (X1, PS4, PC)</td>
                        <td>2nd</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 1v1 Fortnite: BR (X1, PS4, PC)</td>
                        <td>7th</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 2v2 Fortnite: BR (X1, PS4, PC)</td>
                        <td>6th</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 1v1 Fortnite: BR (X1, PS4, PC)</td>
                        <td>1st</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 1v1 Fortnite: BR (X1, PS4, PC)</td>
                        <td>7th</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Global 1v1 Fortnite: BR (X1, PS4, PC)</td>
                        <td>1st</td>
                        <td>9:00 pm EDT 5/16/16</td>
                        <td>
                          <a
                            target="_blank"
                            className="link-italic-black"
                            href="#"
                          >
                            View Brackets
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  hbvtv() {
    const facebookLinkedAccount = this.props.user.facebook ? (
      <a
        role="button"
        className="btn btn-facebook"
        onClick={this.handleUnlink.bind(this, 'facebook')}
      >
        Unlink your Facebook account
      </a>
    ) : (
      <a
        role="button"
        className="btn btn-facebook"
        onClick={this.handleLink.bind(this, 'facebook')}
      >
        Link your Facebook account
      </a>
    );
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h2 className="title_heading">Profile</h2>
              </div>
            </div>
          </div>
        </section>

        <section className="m-b-20">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <Messages messages={this.props.messages} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <form
                  onSubmit={this.handleProfileUpdate.bind(this)}
                  className="form-horizontal user_details_list"
                >
                  <legend>Update Profile</legend>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      readOnly
                      value={this.state.email}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      className="form-control"
                      value={this.state.first_name}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      className="form-control"
                      value={this.state.last_name}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>
                  <div className="form-group ">
                    <label>Gender</label>
                    <div className="row">
                      <label className="radio-inline radio col-sm-4">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={this.state.gender === 'male'}
                          onChange={this.handleChange.bind(this)}
                        />
                        <span> Male</span>
                      </label>
                      <label className="radio-inline col-sm-4">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={this.state.gender === 'female'}
                          onChange={this.handleChange.bind(this)}
                        />
                        <span> Female</span>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      name="age"
                      id="age"
                      className="form-control"
                      value={this.state.age}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>

                  <button type="submit" className="btn btn-success">
                    Update Profile
                  </button>
                </form>
              </div>
              <div className="col-md-6">
                <form
                  onSubmit={this.handleChangePassword.bind(this)}
                  className="form-horizontal  user_details_list"
                >
                  <legend>Change Password</legend>
                  <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="form-control"
                      value={this.state.password}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm">Confirm Password</label>
                    <input
                      type="password"
                      name="confirm"
                      id="confirm"
                      className="form-control"
                      value={this.state.confirm}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>

                  <button type="submit" className="btn btn-success">
                    Change Password
                  </button>
                </form>

                <div className="form-horizontal">
                  <legend>Linked Accounts</legend>
                  <div className="form-group">
                    <div className="col-sm-12">
                      <p>{facebookLinkedAccount}</p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={this.handleDeleteAccount.bind(this)}
                  className="form-horizontal"
                >
                  <legend>Delete Account</legend>
                  <div className="form-group">
                    <p className="col-sm-12">
                      You can delete your account, but keep in mind this action
                      is irreversible.
                    </p>
                    <div className="col-sm-12">
                      <button type="submit" className="btn btn-danger">
                        Delete my account
                      </button>
                    </div>
                  </div>
                </form>
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
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Profile);
