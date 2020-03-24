import React from 'react';
import {connect} from 'react-redux';

class MatchChat extends React.Component {

state ={new_msg:''}
  sendMsg(){
   }

     handleChange(event) {
       this.setState({[event.target.name]: event.target.value});
     }
  render() {
    console.log(this.props);
    let  i_am_in_chat = false;
    if(this.props.user && this.props.user.id){
      if(this.props.user.role == 'admin'){
        i_am_in_chat = true;
      }
      if(this.props.team_1)
      {
        let team_1 = this.props.team_1.split('|');
        team_1 = team_1.map(function(o){return parseInt(o)});
        if(team_1.indexOf(this.props.user.id) > -1){
          i_am_in_chat = true;
        }
      }
      if(this.props.team_2)
      {
        let team_2 = this.props.team_2.split('|');
        team_2 = team_2.map(function(o){return parseInt(o)});
        if(team_2.indexOf(this.props.user.id) > -1){
          i_am_in_chat = true;
        }
      }

    }

    if(i_am_in_chat==false){
      return false;
    }
    return (
      <div class="match_chat_box">
      <div class="match_chat_box_header">Match Chat
      </div>
      <div class="match_chat_box_body">
        <div class="msg_lst"></div>
      </div>
      <div class="match_chat_box_footer">
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
          placeholder={
          'Write a message'

          }
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
