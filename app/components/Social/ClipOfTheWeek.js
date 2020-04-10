import React from 'react';
import Timeline from '../Social/Timeline';

import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import Messages from '../Modules/Messages';
// import {createTeam} from '../../actions/team';
// import {charge} from '../../actions/stripe';

class ClipOfTheWeek extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        week_famous: {},
        month_famous: {}
      };
    }
  componentDidMount() {
     fetch('/api/posts/famous')
       .then(res => res.json())
       .then(json => {
         if (json.ok) {
           this.setState({
             is_loaded: true,
             week_famous: json.week_famous,
             month_famous: json.month_famous
           });
         }
       });
   }



     renderClipMonth() {
       const {settings} = this.props;
       return (
         <>
           {settings.clip_month_video ? (
              <li className="comment">
               <div
                 className="embed-responsive embed-responsive-21by9"
                 style={{marginBottom: '10px'}}
               >
                 <video controls>
                   <source src={settings.clip_month_video} type="video/mp4" />
                 </video>
               </div>
               <p className="feed_post_content">{settings.clip_month_text}</p>
              </li>
           ) : this.state.month_famous ? <Timeline disableSet post={this.state.month_famous} /> :
           (
             <div class="alert alert-warning">Clip not available.</div>
           )}
           </>


       );
     }






  renderClipWeek() {
    const {settings} = this.props;
    return (
      <>
        {settings.clip_week_video ? (
          <li className="comment">
            <div
              className="embed-responsive embed-responsive-21by9"
              style={{marginBottom: '10px'}}
            >
              <video controls>
                <source src={settings.clip_week_video} type="video/mp4" />
              </video>
            </div>
            <p className="feed_post_content">{settings.clip_week_text}</p>
           </li>
        ) : this.state.week_famous ? <Timeline disableSet post={this.state.week_famous} /> :
        (
          <div class="alert alert-warning">Clip not available.</div>
        )}
        </>
    );
  }



  render() {
    // console.log(this.state);
    return (
      <section className="middle_part_login mt-0 mb-5">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2 ">

              <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>Clip of the week</h4>
                </div>
                <ul className="timeline no_pding">{this.renderClipWeek()}</ul>
              </div>

              <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>Clip of the month</h4>
                </div>
                <ul className="timeline no_pding">{this.renderClipMonth()}</ul>
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
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(ClipOfTheWeek);
