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

    };
  }

  componentDidMount() {

  }

  renderClipMonth(){
    let {settings} = this.props;

     if (!settings.clip_month_video) {
      return <div className="alert alert-warning">No clip available</div>;
    }
    return (
      <li className="comment">

        {settings.clip_month_video ? (

            <div
              className="embed-responsive embed-responsive-21by9"
              style={{marginBottom: '10px'}}
            >
              <video controls>
                <source src={settings.clip_month_video} type="video/mp4" />
              </video>
            </div>

        ) : (
          false
        )}
        <p className="feed_post_content">
          {settings.clip_month_text}
        </p>
      </li>

      )
  }



  renderClipWeek(){
    let {settings} = this.props;
    if (!settings.clip_week_video) {
      return <div className="alert alert-warning">No clip available</div>;
    }
    return (
      <li  className="comment">
        {settings.clip_week_video  ? (
            <div
              className="embed-responsive embed-responsive-21by9"
              style={{marginBottom: '10px'}}
            >
              <video controls>
                <source src={settings.clip_week_video} type="video/mp4" />
              </video>
            </div>
        ) : (
          false
        )}
        <p className="feed_post_content">
          {settings.clip_week_text}
        </p>
      </li>
      )
  }


  renderClipDay(){
    let {settings} = this.props;
    if (!settings.clip_day_video) {
      return <div className="alert alert-warning">No clip available</div>;
    }
    return (
      <li className="comment">
        {settings.clip_day_video  ? (
            <div
              className="embed-responsive embed-responsive-21by9"
              style={{marginBottom: '10px'}}
            >
              <video controls>
                <source src={settings.clip_day_video} type="video/mp4" />
              </video>
            </div>
        ) : (
          false
        )}
        <p className="feed_post_content">
          {settings.clip_day_text}
        </p>
      </li>
      )
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
                  <h4>Clip of the day</h4>
                </div>

                  <ul className="timeline">
                    { this.renderClipDay() }
                  </ul>

              </div>


               <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>Clip of the week</h4>
                </div>

                  <ul className="timeline">
                    { this.renderClipWeek() }
                  </ul>

              </div>



               <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>Clip of the month</h4>
                </div>

                  <ul className="timeline">
                    { this.renderClipMonth() }
                  </ul>

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

