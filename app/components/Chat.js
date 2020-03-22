import React from 'react';
import {connect} from 'react-redux';
// import TitleBar from './Modules/TitleBar';
import moment from 'moment';

import {sendDM} from '../actions/orders';

// import Messages from './Modules/Messages';
import {Link} from 'react-router';
// import price_list from '../Modules/price_list.js';
// const price_types_labels = price_list.keyed;
import HeaderBox from './modules/HeaderBox'
class SingleListing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      is_loaded: false,
      limit: 100,
      chats: [],
      currently_showing: false,
      chat_search: '',
      new_msg: ''
    };
  }
  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  sendMsg() {
    if (this.state.new_msg.trim() == '') {
      return;
    }
    this.props.dispatch(
      sendDM(
        this.state.new_msg,
        this.state.to_id,
        this.state.currently_showing,
        () => {
          this.loadChatFor(
            this.state.to_id,
            this.state.currently_showing,
            this.state.other
          );
        }
      )
    );
    // this.state.chats.push({
    //
    // })
  }

  runQry() {
    fetch('/api/dm/mygroups?clear_too=yes').then(res => {
      if (res) {
        res.json().then(obj => {
          // if (obj.item) {
          this.setState(
            {
              is_loaded: true,
              groups: obj.items ? obj.items : []
            },
            this.loadReads
          );
          // }
        });
      }
    });
  }

  loadReads() {
    for (let i = 0; i < this.state.groups.length; i++) {
      const grp_id = this.state.groups[i].id;
      this.fetchCount(grp_id);
    }
  }

  fetchCount(grp_id) {
    fetch('/api/dm/group_has_unread?grp_id=' + grp_id).then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState({
            ['grp_' + grp_id + '_unread']: parseInt(obj.count)
          });
        });
      }
    });
  }

  loadChatFor(id, e_id, other) {
    this.setState({
      ['grp_' + e_id + '_unread']: 0
    });
    fetch('/api/dm/chatFor?other_id=' + id).then(res => {
      if (res) {
        res.json().then(obj => {
          // if (obj.item) {
          this.setState(
            {
              is_loaded: true,
              currently_showing: e_id,
              to_id: id,
              other: other,
              chats: obj.items,
              new_msg: ''
            },
            () => {
              window.setTimeout(function() {
                const a = jQuery('.msg_history');
                a[0].scrollTop = a[0].scrollHeight;
              }, 100);
            }
          );
          // }
        });
      }
    });
  }

  componentDidMount() {
    this.runQry();
  }

  render() {
    if (!this.state.is_loaded) {
      return (
        <div className="text-center text-lg p-5">
          <span className="fa fa-spin fa-spinner" style={{fontSize: 100}} />
        </div>
      );
    }
    // const {obj} = this.state;
    // const price_obj = JSON.parse(obj.price_obj);
    return (

      <div>
        <HeaderBox title={'Chat'} cls="all_t_heading" />

        <section className="faq-section mb-5">
          <div className="container mb-5">
            <div className="row mb-5">
              <div className="col-md-12 mb-5">


            <div
              className={
                'messaging' +
                (this.state.currently_showing ? ' showing_chat' : ' ')
              }
              style={{padding: 0, minHeight: '78vh'}}
            >
              <div
                className="inbox_msg"
                style={{borderTop: 0, borderBottom: 0, minHeight: '78vh'}}
              >
                <div className="inbox_people" style={{minHeight: '78vh'}}>
                  <div className="headind_srch" style={{height: '70px'}}>
                    <div className="recent_heading">
                      <h4>&nbsp;</h4>
                    </div>
                    <div className="srch_bar">
                      <div className="stylish-input-group">
                        <input
                          type="text"
                          className="search-bar form-control dib m-0"
                          value={this.state.chat_search}
                          id="chat_search"
                          name="chat_search"
                          onChange={this.handleChange.bind(this)}
                          placeholder="Search"
                        />
                        <span className="input-group-addon">
                          <button type="button">
                            <i className="fa fa-search" aria-hidden="true" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="inbox_chat"
                    style={{padding: 0, height: 'auto', minHeight: 'calc(73vh - 70px)'}}
                  >
                    {this.state.groups.map((item, i) => {
                      const other =
                        this.props.user.id == item.user_2_id
                          ? item.user_1
                          : item.user_2;
                      const name = other.first_name + ' ' + other.last_name;
                      if (
                        this.state.chat_search &&
                        name
                          .toLowerCase()
                          .indexOf(
                            this.state.chat_search.toLowerCase().trim()
                          ) < 0
                      ) {
                        return false;
                      }
                      const img = other.profile_picture ? other.profile_picture  : 'https://ui-avatars.com/api/?background=ec6b33&color=fff&name=' +
                      name;
                      return (
                        <div
                          className={
                            (this.state.currently_showing == item.id
                              ? ' active '
                              : ' ') + 'chat_list'
                          }
                          key={item.id}
                        >
                          <Link
                            className="chat_avatar"
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              this.loadChatFor(other.id, item.id, other);
                            }}
                          >
                            <div className="chat_people">
                              <div className="chat_img">
                                <img
                                  src={
                                    img
                                  }
                                  alt={name}
                                />
                              </div>
                              <div className="chat_ib">
                                <h5>{name}</h5>
                                {parseInt(
                                  this.state['grp_' + item.id + '_unread']
                                ) > 0 ? (
                                  <span
                                    className="badge badge-success"
                                    style={{
                                      width: 'auto',
                                      float: 'right',
                                      color: '#fff'
                                    }}
                                  >
                                    New
                                  </span>
                                ) : (
                                  false
                                )}
                                <span className="chat_date">
                                  {moment(item.created_at).fromNow()}
                                </span>
                                {/* <p>
                                  Test, which is a new approach to have all solutions
                                  astrology under one roof.
                                </p> */}
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mesgs" style={{padding: '1px' ,     height: '78vh'}}>
                  <div className="msg_history" style={{height: 'calc(78vh - 50px)'}}>
                    {this.state.chats.map((chat, i) => {
                      const cls =
                        chat.from_id == this.props.user.id
                          ? ' outgoing_msg '
                          : 'incoming_msg';
                      const name =
                        this.state.other.first_name +
                        ' ' +
                        this.state.other.last_name;

                      if (cls == ' outgoing_msg ') {
                        return (
                          <div className="outgoing_msg" key={chat.id}>
                            <div className="sent_msg">
                              <p>{chat.message}</p>
                              <span className="time_date">
                                {moment(chat.created_at).fromNow()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className={cls} key={chat.id}>
                          <div className={cls + '_img'}>
                            <img
                              src={
                                'https://ui-avatars.com/api/?background=ec6b33&color=fff&name=' +
                                name
                              }
                              //src="https://ptetutorials.com/images/user-profile.png"
                            />
                          </div>
                          <div className="received_msg">
                            <div className="received_withd_msg">
                              <p>{chat.message}</p>
                              <span className="time_date">
                                {moment(chat.created_at).fromNow()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="type_msg">
                    <div className="input_msg_write">
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          this.sendMsg();
                        }}
                      >
                        <input
                          type="text"
                          className="write_msg"
                          autoFocus
                          placeholder={
                            this.state.currently_showing
                              ? 'Write a message'
                              : 'Choose username to start a chat.'
                          }
                          value={this.state.new_msg}
                          disabled={!this.state.currently_showing}
                          id="new_msg"
                          name="new_msg"
                          onChange={this.handleChange.bind(this)}
                        />
                        <button type="submit"                            disabled={!this.state.currently_showing}
 className="cht_send_btn  ">
                          Send
                        </button>

                      </form>
                    </div>
                  </div>
                  <div className="close_chat d-md-none d-lg-none d-inline-block">
                    <Link
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        this.setState({
                          currently_showing: false
                        });
                      }}
                    >
                      <span className="fa fa-chevron-left" /> All Chats
                    </Link>
                  </div>
                </div>
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

export default connect(mapStateToProps)(SingleListing);
