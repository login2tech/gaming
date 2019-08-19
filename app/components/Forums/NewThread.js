import React from 'react';
import {connect} from 'react-redux';
// import axios from 'axios';
import Messages from '../Modules/Messages';

class NewThread extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ticket_type: '',
      ticket_title: '',
      ticket_description: '',
      new_post_image : '',
    };
  }
 

  submitForm(event) {
    event.preventDefault();
    // fetch(, function(){

    fetch('/api/thread/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // ticket_type: this.state.ticket_type,
        ticket_title: this.state.ticket_title,
        ticket_description: this.state.ticket_description,
        topic_id : this.props.params.id
        // ticket_attachment : this.state.new_post_image
      })
    }).then(rawResponse => {
      rawResponse
        .json()
        .then(json => {
          // console.log(json);
          const element = document.getElementById('less_padding');
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest'
            });
          }
          if (rawResponse.ok) {
            this.props.dispatch({
              type: 'SUCCESS',
              messages: Array.isArray(json) ? json : [json]
            });
            this.setState(
              {
                text: '',
                cur_page: 1
              },
              () => {
                // this.fetchReplies();
                window.location.href = '/forums/'+this.props.params.id+'/'+this.props.params.title;
              }
            );
          } else {
            this.props.dispatch({
              type: 'FAILURE',
              messages: Array.isArray(json) ? json : [json]
            });
          }
        })
        .catch(err => {
          const json = {ok: false, msg: 'Some error occoured'};
          this.props.dispatch({
            type: 'FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
    });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    return (
      <div>
        <section className="page_title_bar less_padding">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Create a New Thread in <span>{this.props.params.title}</span></h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <Messages messages={this.props.messages} />

                <form onSubmit={this.submitForm.bind(this)}>
                
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="title">* Title</label>
                        <input
                          type="text"
                          className="form-control"
                          id="ticket_title"
                          name="ticket_title"
                          required
                          value={this.state.ticket_title}
                          onChange={this.handleChange.bind(this)}
                          placeholder="Enter Thread Title"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="comment">Thread Description:</label>
                        <textarea
                          rows="8"
                          className="form-control"
                          id="ticket_description"
                          name="ticket_description"
                          required
                          value={this.state.ticket_description}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                    </div>
                  </div>
           
                  <div className="row">
                    <div className="col-md-12 text-right">
                      <button
                        className="btn btn-blue btn-lg bttn_submit"
                        type="submit"
                        disabled={ !this.state.ticket_title || !this.state.ticket_description}
                      >
                        Create Thread
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
// export default SingleThread;
export default connect(mapStateToProps)(NewThread);
