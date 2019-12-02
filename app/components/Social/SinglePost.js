import React from 'react';
import {connect} from 'react-redux';
import Timeline from './Timeline';
// import moment from 'moment';

class SinlgePost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      post: {}
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    this.runQuery();
  }
  runQuery() {
    fetch('/api/posts/single/' + this.props.params.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            post: json.post
          });
        }
      });
  }

  renderGoBack() {
    console.log(history.length);
    return (
      <a
        href="/feed"
        className=""
        onClick={e => {
          if (history.length == 1) {
            return;
          }
          history.back();
          e.preventDefault();
        }}
      >
        <span className="fa fa-arrow-left" /> back to feed
      </a>
    );
  }

  render() {
    return (
      <div>
        <section className="page_title_bar less_padding" id="is_top">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Post</h3>
                  <br />
                  {this.renderGoBack()}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="row">
                  <div className="col-md-8 offset-md-2">
                    {this.state.is_loaded ? (
                      <ul className="timeline">
                        <Timeline
                          post={this.state.post}
                          key={this.state.post}
                          expand_comments
                          is_single
                        />
                      </ul>
                    ) : (
                      <div className="text-center">
                        <span className="fa fa-spinner fa-spin" />
                      </div>
                    )}
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
// export default SingleTicket;
export default connect(mapStateToProps)(SinlgePost);
