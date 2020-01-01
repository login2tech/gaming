import React from 'react';
import {connect} from 'react-redux';
// import {charge} from '../../actions/stripe';
import Messages from '../Modules/Messages';
import timezones from '../Modules/timezones';
import {Link} from 'react-router';
import moment from 'moment';
import axios from 'axios';
import MyBankModule from './Modules/MyBankModule';
import MyMembershipModule2 from './Modules/MyMembershipModule2';

import {accountPic} from '../../actions/auth';
import {
  updateProfile,
  stopRenewal,
  changePassword,
  logout
} from '../../actions/auth';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.user.email ? props.user.email : '',
      timezone: props.user.timezone ? props.user.timezone : '',
      first_name: props.user.first_name ? props.user.first_name : '',
      last_name: props.user.last_name ? props.user.last_name : '',
      gender: props.user.gender ? props.user.gender : '',
      dob: props.user.dob ? props.user.dob : '',
      add_new_bal_number: '',
      password: '',
      confirm: '',
      old_password: '',
      currentStep: 5,
      init_transaction_mode: '',
      clicked: false,
      gamer_tag_1: props.user.gamer_tag_1 ? props.user.gamer_tag_1 : '',
      gamer_tag_2: props.user.gamer_tag_2 ? props.user.gamer_tag_2 : '',
      gamer_tag_3: props.user.gamer_tag_3 ? props.user.gamer_tag_3 : '',
      gamer_tag_4: props.user.gamer_tag_4 ? props.user.gamer_tag_4 : '',
      gamer_tag_5: props.user.gamer_tag_5 ? props.user.gamer_tag_5 : '',
      gamer_tag_6: props.user.gamer_tag_6 ? props.user.gamer_tag_6 : '',

      name_on_card: '',

      amount_to_withdraw: '',
      withdraw_method: '',
      withdraw_path: ''
    };
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({[event.target.name]: event.target.value});
  }

  handleLogout = event => {
    event.preventDefault();
    this.props.dispatch(logout());
  };

  handleProfileUpdate(event) {
    event.preventDefault();
    this.props.dispatch(
      updateProfile(
        {
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          gender: this.state.gender,
          dob: this.state.dob,
          gamer_tag_1: this.state.gamer_tag_1,
          timezone: this.state.timezone,
          gamer_tag_2: this.state.gamer_tag_2,
          gamer_tag_3: this.state.gamer_tag_3,
          gamer_tag_4: this.state.gamer_tag_4,
          gamer_tag_5: this.state.gamer_tag_5,
          gamer_tag_6: this.state.gamer_tag_6
        },
        this.props.token
      )
    );
    const element = document.body;
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  handleChangePassword(event) {
    event.preventDefault();
    this.props.dispatch(
      changePassword(
        this.state.password,
        this.state.confirm,
        this.state.old_password,
        this.props.token
      )
    );
    setTimeout(() => {
      // const element = document.body;
      const element = jQuery('.contet_part')[0];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
      this.setState({
        password: '',
        confirm: ''
      });
    }, 1000);
  }

  handleStopRenewal(event, item) {
    event.preventDefault();
    this.props.dispatch(stopRenewal(item, this.props.token));
  }

  handleCoverFile = event => {
    this.setState(
      {
        cover_image_select: event.target.files[0],
        saving_cover_photo: true,
        loaded: 0
      },
      () => {
        this.askFile('cover_image_select', data => {
          if (data && data.file) {
            this.setState({
              saving_cover_photo: false,
              new_cover_pic: data.file,
              new_cover_pic_saved: false
            });
          }
        });
      }
    );
  };

  handleselectedFile = event => {
    this.setState(
      {
        profile_image_select: event.target.files[0],
        saving_profile_photo: true,
        loaded: 0
      },
      () => {
        this.askFile('profile_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_profile_pic: data.file,
              saving_profile_photo: false,
              new_profile_pic_saved: false
            });
          }
        });
      }
    );
  };
  doSaveProfilePic(event) {
    this.setState({
      saving_profile_photo: true
    });
    if (!this.state.new_profile_pic) {
      return;
    }

    event.preventDefault();
    this.props.dispatch(
      accountPic(
        {
          profile_picture: this.state.new_profile_pic
        },
        st => {
          const obj = {saving_profile_photo: false};
          if (st) {
            obj.new_profile_pic = '';
            obj.new_profile_pic_saved = false;
          }
          this.setState(obj, () => {});
        }
      )
    );
  }

  doSaveCoverPic(event) {
    if (!this.state.new_cover_pic) {
      return;
    }
    this.setState({
      saving_cover_photo: true
    });

    event.preventDefault();
    this.props.dispatch(
      accountPic(
        {
          cover_picture: this.state.new_cover_pic
        },

        st => {
          const obj = {saving_cover_photo: false};
          if (st) {
            obj.new_cover_pic = '';
            obj.new_cover_pic_saved = false;
          }
          this.setState(obj);
        }
      )
    );
  }

  askFile(cls, cb) {
    if (!this.state[cls]) {
      return;
    }
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          });
        }
      })
      .then(res => {
        // console.log(res.data);

        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured.');
        // console.log(err);
      });
  }

  renderStep4() {
    return (
      <div>
        <MyMembershipModule2
          id={this.props.user.id}
          user_info={this.props.user}
        />
        <MyBankModule id={this.props.user.id} user_info={this.props.user} />
      </div>
    );
  }
  tags = [1, 2, 3, 4, 5, 6];
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    'Epic Games Username',
    'Steam Username',
    'Battletag',
    'Activision Id'
  ];

  renderStep5() {
    return (
      <div className="tab-pane" data-tab="tab2">
        <Messages messages={this.props.messages} />

        <form
          onSubmit={this.handleProfileUpdate.bind(this)}
          className="form-horizontal user_details_list"
        >
          <legend>Update Profile</legend>

          <Link
            className="text-danger"
            onClick={e => {
              this.handleLogout(e);
            }}
          >
            (logout?)
          </Link>
          <br />
          <br />
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
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
                <div className="row" style={{height: '53px'}}>
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
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="text"
                  name="dob"
                  id="dob"
                  className="form-control"
                  value={this.state.dob}
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  onChange={this.handleChange.bind(this)}
                  className="form-control"
                  name="timezone"
                  size={'normal'}
                  id="timezone"
                  value={this.state.timezone}
                  required
                >
                  <option value="">-Select-</option>
                  {timezones.map((timezone, i) => {
                    return (
                      <option value={timezone.value} key={timezone.label}>
                        {timezone.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              {this.tags.map((k, i) => {
                return (
                  <div className="form-group" key={k}>
                    <label htmlFor="last_name">{this.tag_names[k]}</label>
                    <input
                      type="text"
                      name={'gamer_tag_' + k}
                      id={'gamer_tag_' + k}
                      className="form-control"
                      value={this.state['gamer_tag_' + k]}
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <button type="submit" className="btn btn-primary  max-width-300">
            Update Profile
          </button>
        </form>

        <br />
        <br />
        <form
          onSubmit={this.handleChangePassword.bind(this)}
          className="form-horizontal  user_details_list "
        >
          <legend>Change Password</legend>
          <div className="row">
            <div className="form-group col-md-6">
              <label htmlFor="old_password">Old Password</label>
              <input
                type="password"
                name="old_password"
                id="old_password"
                className="form-control"
                value={this.state.old_password}
                onChange={this.handleChange.bind(this)}
              />
            </div>
          </div>
          <div className="row">
            <div className="form-group col-md-6">
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
            <div className="form-group col-md-6">
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
          </div>

          <button type="submit" className="btn btn-primary max-width-300">
            CHANGE PASSWORD
          </button>
        </form>

        {/*}
          <div className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-12">
                <p>{facebookLinkedAccount}</p>
              </div>
            </div>
          </div><form
            onSubmit={this.handleDeleteAccount.bind(this)}
            className="form-horizontal"
          >
            <legend>
              <Translate id="delete_account" />
            </legend>
            <div className="form-group">
              <p className="col-sm-12">
                <Translate id="can_not_undo" />
              </p>
              <div className="col-sm-12">
                <button type="submit" className="btn btn-danger">
                  DELETE MY ACCOUNT
                </button>
              </div>
            </div>
          </form>*/}
      </div>
    );
  }

  // renderStep2() {
  //   let prime_info = false;
  //   let tmp;
  //   let prime_obj = false;
  //   let double_xp_obj = false;
  //   if (this.props.user.prime) {
  //     tmp = JSON.parse(this.props.user.prime_obj);
  //     prime_obj = tmp;
  //     prime_info = (
  //       <span>
  //         <strong className="text-white">Started On: </strong>
  //         <span className="text-success">
  //           {moment.unix(tmp.start).format('lll')}
  //         </span>
  //       </span>
  //     );
  //   }
  //   let double_xp_info = false;
  //   if (this.props.user.double_xp) {
  //     tmp = JSON.parse(this.props.user.double_xp_obj);
  //     double_xp_obj = tmp;
  //     if (!tmp.starts_on) {
  //       double_xp_info = (
  //         <span>
  //           <strong className="text-white">Started Manually by admin</strong>
  //         </span>
  //       );
  //     } else {
  //       double_xp_info = (
  //         <span>
  //           <strong className="text-white">Started On: </strong>
  //           <span className="text-success">
  //             {moment(tmp.starts_on).format('lll')}
  //           </span>
  //         </span>
  //       );
  //     }
  //   }
  //   return (
  //     <div className="tab-pane" data-tab="tab1">
  //       <div className="billing_details">
  //         <div className="list_pad">
  //           <div className="row">
  //             <div className="col-md-6">
  //               <h5 className="credit_summary">Official Comp Membership</h5>
  //               <img
  //                 src="/assets/icons/ocg_member.png"
  //                 style={{
  //                   height: '150px',
  //                   marginTop: '20px',
  //                   marginBottom: '20px'
  //                 }}
  //               />
  //               {this.props.user.prime ? (
  //                 <p>
  //                   <strong className="text-white">Status:</strong>{' '}
  //                   <span className="text-success">enabled</span>
  //                   <br />
  //                   {prime_info}
  //                   <br />
  //                   {prime_obj.current_period_end ? (
  //                     <span>
  //                       <strong className="text-white">
  //                         {prime_obj.ending_on_period_end
  //                           ? 'Stops on: '
  //                           : 'Renews On'}
  //                         :{' '}
  //                       </strong>
  //                       <span className="text-success">
  //                         {moment
  //                           .unix(prime_obj.current_period_end)
  //                           .format('lll')}
  //                       </span>
  //                     </span>
  //                   ) : (
  //                     false
  //                   )}
  //                   <br />
  //                   <br />
  //                   {prime_obj.current_period_end &&
  //                   !prime_obj.ending_on_period_end ? (
  //                     <button
  //                       className="btn btn-danger btn-xs"
  //                       onClick={e => {
  //                         this.handleStopRenewal(e, 'prime');
  //                       }}
  //                     >
  //                       Stop Renewing
  //                     </button>
  //                   ) : (
  //                     false
  //                   )}
  //                 </p>
  //               ) : (
  //                 <p>
  //                   <strong className="text-white">Status:</strong>{' '}
  //                   <span className="text-danger">Disabled</span>{' '}
  //                   <Link to="/shop">Click to enable</Link>
  //                 </p>
  //               )}
  //             </div>
  //             <div className="col-md-6">
  //               <h5 className="credit_summary">Double XP</h5>
  //               <img
  //                 src="/assets/icons/coin-02.png"
  //                 style={{
  //                   height: '150px',
  //                   marginTop: '20px',
  //                   marginBottom: '20px'
  //                 }}
  //               />
  //               {this.props.user.double_xp ? (
  //                 <p>
  //                   <strong className="text-white">Status:</strong>{' '}
  //                   <span className="text-success">enabled</span>
  //                   <br />
  //                   {double_xp_info}
  //                   <br />
  //                   {this.props.user.double_xp_exp ? (
  //                     <span>
  //                       <strong className="text-white">Ends on: </strong>
  //                       <span className="text-success">
  //                         {moment(this.props.user.double_xp_exp).format('lll')}
  //                       </span>
  //                     </span>
  //                   ) : (
  //                     false
  //                   )}
  //                   <br />
  //                   <br />
  //                   {double_xp_obj.current_period_end &&
  //                   !double_xp_obj.ending_on_period_end ? (
  //                     <button
  //                       className="btn btn-danger btn-xs"
  //                       onClick={e => {
  //                         this.handleStopRenewal(e, 'double_xp');
  //                       }}
  //                     >
  //                       Stop Renewing
  //                     </button>
  //                   ) : (
  //                     false
  //                   )}
  //                 </p>
  //               ) : (
  //                 <p>
  //                   <strong className="text-white">Status:</strong>{' '}
  //                   <span className="text-danger">Disabled</span>{' '}
  //                   <Link to="/shop">Click to enable</Link>
  //                 </p>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  render() {
    const divStyle = this.state.new_cover_pic
      ? {
          backgroundImage: 'url(' + this.state.new_cover_pic + ')'
        }
      : this.props.user.cover_picture
        ? {
            backgroundImage: 'url(' + this.props.user.cover_picture + ')'
          }
        : {};

    return (
      <div>
        <section
          className="page_title_bar less_padding"
          id="is_top"
          style={divStyle}
        >
          {this.state.saving_cover_photo ? (
            <div className="photo_progress cover_progress">
              <span className="fa fa-spinner fa-spin" />
            </div>
          ) : (
            false
          )}
          <div className="update_btn cover">
            <label htmlFor="cover_image_select" className=" expand_on_hover">
              <i className="fa fa-edit" /> <span>upload banner</span>
            </label>

            {this.state.new_cover_pic && !this.state.new_cover_pic_saved ? (
              <button
                onClick={event => {
                  this.doSaveCoverPic(event);
                }}
                type="button"
                className="expand_on_hover"
              >
                <i className="fa fa-save" /> <span>save new banner</span>
              </button>
            ) : (
              false
            )}

            <input
              type="file"
              name="cover_image_select"
              id="cover_image_select"
              className="hidden hide"
              accept="image/gif, image/jpeg, image/png"
              onChange={this.handleCoverFile.bind(this)}
            />
          </div>

          <div className="container">
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12">
                <div className="game_pic_tournament profile_pic_outline square">
                  <div className="content">
                    <div className="update_btn">
                      <label
                        htmlFor="profile_image_select"
                        className="expand_on_hover"
                      >
                        <i className="fa fa-edit" /> <span>edit picture</span>
                      </label>

                      {this.state.new_profile_pic &&
                      !this.state.new_profile_pic_saved ? (
                        <button
                          onClick={event => {
                            this.doSaveProfilePic(event);
                          }}
                          type="button"
                          className="expand_on_hover"
                        >
                          <i className="fa fa-save" /> <span>save</span>
                        </button>
                      ) : (
                        false
                      )}

                      <input
                        type="file"
                        name="profile_image_select"
                        id="profile_image_select"
                        className="hidden hide"
                        accept="image/gif, image/jpeg, image/png"
                        onChange={this.handleselectedFile}
                      />
                    </div>

                    {this.state.saving_profile_photo ? (
                      <div className="photo_progress">
                        <span className="fa fa-spinner fa-spin" />
                      </div>
                    ) : (
                      false
                    )}
                    {this.state.new_profile_pic ? (
                      <img
                        src={this.state.new_profile_pic}
                        className="img-fluid"
                      />
                    ) : this.props.user.profile_picture ? (
                      <img
                        src={this.props.user.profile_picture}
                        className="img-fluid "
                      />
                    ) : (
                      <img
                        className="img-fluid"
                        src={
                          'https://ui-avatars.com/api/?size=512&name=' +
                          this.props.user.first_name +
                          ' ' +
                          this.props.user.last_name +
                          '&color=223cf3&background=000000'
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3 className="no-case-change">
                    <Link to={'/u/' + this.props.user.username}>
                      @{this.props.user.username}
                    </Link>
                  </h3>
                  {/* <div className="game_platform_icon">About</div> */}
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-6">
                        <span> MEMBER SINCE</span>
                        <p>
                          {moment(this.props.user.created_at).format('lll')}
                        </p>
                      </div>

                      <div className="col-6">
                        <span> TIME ZONE </span>
                        <p>
                          {this.props.user.timezone
                            ? this.props.user.timezone
                            : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="tab-block" id="tab-block">
                  <ul className="tab-mnu">
                    <li
                      data-tab="tab2"
                      className={
                        this.state.currentStep == 3
                          ? 'active float-right'
                          : 'float-right'
                      }
                    >
                      <Link to={'/u/' + this.props.user.username}>
                        Public Profile
                      </Link>
                    </li>

                    <li
                      data-tab="tab2"
                      className={this.state.currentStep == 5 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 5});
                      }}
                    >
                      Edit Profile
                    </li>

                    <li
                      className={this.state.currentStep == 4 ? 'active' : ''}
                      onClick={() => {
                        this.setState({currentStep: 4});
                      }}
                      data-tab="tab3"
                    >
                      My Bank & Memberships
                    </li>
                  </ul>

                  <div className="tab-cont">
                    {this.state.currentStep == 4 ? this.renderStep4() : false}
                    {this.state.currentStep == 5 ? this.renderStep5() : false}
                  </div>
                </div>
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
