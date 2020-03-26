import React from 'react';
import {connect} from 'react-redux';
import {sendMatchMsg} from '../../actions/orders';
import {Link} from 'react-router';
let socket;
class MatchChat extends React.Component {
  state = {new_msg: '', chat_visible: false};

  componentDidMount() {
    this.loadChatFor();
    if (!this.props.user) {
      return;
    }
    let i_am_in_chat = false;
    if (this.props.user && this.props.user.id) {
      if (this.props.user.role == 'admin') {
        i_am_in_chat = true;
      }
      if (this.props.team_1) {
        let team_1 = this.props.team_1.split('|');
        team_1 = team_1.map(function(o) {
          return parseInt(o);
        });
        if (team_1.indexOf(this.props.user.id) > -1) {
          i_am_in_chat = true;
        }
      }
      if (this.props.team_2) {
        let team_2 = this.props.team_2.split('|');
        team_2 = team_2.map(function(o) {
          return parseInt(o);
        });
        if (team_2.indexOf(this.props.user.id) > -1) {
          i_am_in_chat = true;
        }
      }
    }

    if (i_am_in_chat == false) {
      return false;
    }
    socket = io();
    socket.on('login', data => {});
    socket.emit('add match_user', this.props.user.username);
    socket.on('disconnect', () => {
      // log('you have been disconnected');
    });

    socket.on('reconnect', () => {
      // log('you have been reconnected');
      socket.emit('add user', this.props.user.username);
    });

    socket.on('reconnect_error', () => {
      // log('attempt to reconnect has failed');
    });

    socket.on('new matchChat', data => {
      if (data.match_type != this.props.match_type) {
        return;
      }
      if (data.match_id != this.props.match_id) {
        return;
      }
      this.loadChatFor();
    });
  }

  loadChatFor() {
    fetch(
      '/api/dm/chatForMatch?match_id=' +
        this.props.match_id +
        '&match_type=' +
        this.props.match_type
    ).then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState(
            {
              chats: obj.items,
              new_msg: ''
            },
            () => {
              window.setTimeout(function() {
                const a = jQuery('.msg_lst');
                a[0].scrollTop = a[0].scrollHeight;
              }, 100);
            }
          );
        });
      }
    });
  }

  sendMsg() {
    if (this.state.new_msg.trim() == '') {
      return;
    }
    this.props.dispatch(
      sendMatchMsg(
        this.state.new_msg,
        this.props.match_id,
        this.props.match_type,
        () => {
          this.loadChatFor(
            this.state.to_id,
            this.state.currently_showing,
            this.state.other
          );
          socket.emit('new matchChat', {
            match_type: this.props.match_type,
            match_id: this.props.match_id
          });
          this.setState({
            new_msg: ''
          });
        }
      )
    );
    // t
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  render() {
    let i_am_in_chat = false;
    if (this.props.user && this.props.user.id) {
      if (this.props.user.role == 'admin') {
        i_am_in_chat = true;
      }
      if (this.props.team_1) {
        let team_1 = this.props.team_1.split('|');
        team_1 = team_1.map(function(o) {
          return parseInt(o);
        });
        if (team_1.indexOf(this.props.user.id) > -1) {
          i_am_in_chat = true;
        }
      }
      if (this.props.team_2) {
        let team_2 = this.props.team_2.split('|');
        team_2 = team_2.map(function(o) {
          return parseInt(o);
        });
        if (team_2.indexOf(this.props.user.id) > -1) {
          i_am_in_chat = true;
        }
      }
    }

    if (i_am_in_chat == false) {
      return false;
    }
    return (
      <div
        className={
          'match_chat_box ' + (this.state.chat_visible ? ' ' : 'chtcollapsed')
        }
      >
        <div className="match_chat_box_header">
          Match Chat
          <button
            className="m_chtclose_btn btn-outline"
            onClick={() => {
              this.setState({
                chat_visible: !this.state.chat_visible
              });
            }}
          >
            {this.state.chat_visible ? (
              <span className="fa fa-chevron-down" />
            ) : (
              <span className="fa fa-chevron-up" />
            )}
          </button>
        </div>
        <div
          className={
            'match_chat_box_body ' + (this.state.chat_visible ? ' ' : 'd-none')
          }
        >
          <div className="msg_lst">
            {this.state.chats &&
              this.state.chats.map((k, i) => {
                return (
                  <div key={k.id} className="row mchat_row no-gutters">
                    <div className="col-2">
                      <div className={'incoming_msg' + '_img'}>
                        <Link to={'/u/' + k.from.username}>
                          <img
                            src={k.from.profile_picture || k.from.gravatar}
                          />
                        </Link>
                      </div>
                    </div>
                    <div className="col-10 chtm">
                      <Link to={'/u/' + k.from.username}>
                        @{k.from.username}
                      </Link>
                      <br />
                      {k.message}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div
          className={
            'match_chat_box_footer ' +
            (this.state.chat_visible ? ' ' : 'd-none')
          }
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              this.sendMsg();
            }}
          >
            <input
              type="text"
              className="form-control"
              autoFocus
              placeholder={'Write a message'}
              value={this.state.new_msg}
              id="new_msg"
              name="new_msg"
              onChange={this.handleChange.bind(this)}
            />
            <button type="submit" className="cht_send_btn  ">
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user
  };
};

// Header = withLocalize(Header);

export default connect(mapStateToProps)(MatchChat);
