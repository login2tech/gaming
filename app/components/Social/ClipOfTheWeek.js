import React from 'react';
import Timeline from '../Social/Timeline';

// import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import Messages from '../Modules/Messages';
// import {createTeam} from '../../actions/team';
// import {charge} from '../../actions/stripe';

class ClipOfTheWeek extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // title: '',
      // ladder: '',
      // games: []
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

  renderClipWeek() {
    return <Timeline post={this.state.week_famous} />;
  }
  renderClipMonth() {
    if (!this.state.month_famous.id) {
      return <div className="alert alert-warning">No clip available</div>;
    }
    return <Timeline post={this.state.month_famous} />;
  }

  render() {
    // console.log(this.state);
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2 ">
              <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>Clip of the week</h4>
                </div>

                {!this.state.week_famous.id ? (
                  <div className="alert alert-warning">No clip available</div>
                ) : (
                  <ul className="timeline">
                    {this.state.is_loaded ? this.renderClipWeek() : false}
                  </ul>
                )}
              </div>
              <div
                className="authorize_box"
                style={{maxWidth: '100%', marginTop: 50}}
              >
                <div className="title_default_dark title_border text-center">
                  <h4>Clip of the month</h4>
                </div>

                {!this.state.month_famous.id ? (
                  <div className="alert alert-warning">No clip available</div>
                ) : (
                  <ul className="timeline">
                    {this.state.is_loaded ? this.renderClipMonth() : false}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
export default ClipOfTheWeek;
