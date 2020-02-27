import React from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import Messages from '../Modules/Messages';

class NewTicket extends React.Component {
  constructor(props) {
    super(props);

    let match_type = '';
    if (props.params.mtype == 'm') {
      match_type = 'MatchFinder';
    } else if (props.params.mtype == 'mm') {
      match_type = 'Mix-and-match';
    } else if (props.params.mtype == 't') {
      match_type = 'Tournament';
    }

    this.state = {
      ticket_type:
        props.params.type && props.params.type == 'disputed'
          ? 'Match Support - Match Dispute'
          : props.params.via && props.params.username
            ? 'Customer Support - Dispute Account Ban'
            : '',
      ticket_title: '',
      upload_started: false,
      ticket_description: '',
      new_post_image: '',
      extra_1: props.params.mid ? props.params.mid : '',
      extra_2: props.params.ttile ? props.params.ttile : '',
      extra_3: match_type,
      url_1: '',
      url_2: '',
      url_3: '',
      readonlyFields: props.params.mid ? true : false
    };
  }

  askFile(cls, cb) {
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          //
        }
      })
      .then(res => {
        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured in uploading file..');
        this.setState({
          upload_started: false
        });
        // console.log(err);
      });
  }

  handleImageUpload = event => {
    this.setState(
      {
        post_image_select: event.target.files[0],
        upload_started: true,
        uploaded: false
      },
      () => {
        this.askFile('post_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_post_image: data.file,
              upload_started: false,
              uploaded: true
            });
          }
        });
      }
    );
  };

  submitForm(event) {
    event.preventDefault();
    if (this.state.submit_started) {
      return false;
    }

    this.setState({
      submit_started: true
    });
    // fetch(, function(){
    let url = '/api/tickets/add';
    if (
      this.props.params &&
      this.props.params.via &&
      this.props.params.username
    ) {
      url = '/api/tickets/addforbanned';
    }

    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ticket_type: this.state.ticket_type,
        ticket_title: this.state.ticket_title,
        banned_uname: this.props.params.username,
        ticket_description: this.state.ticket_description,
        ticket_attachment: this.state.new_post_image,
        extra_1: this.state.extra_1,
        extra_2: this.state.extra_2,
        extra_3: this.state.extra_3,
        url_1: this.state.url_1,
        url_2: this.state.url_2,
        url_3: this.state.url_3
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
                submit_started: false,
                cur_page: 1
              },
              () => {
                // this.fetchReplies();
                if (this.props.params.via) {
                  this.setState({
                    ticket_title: '',
                    ticket_description: '',
                    ticket_attachment: '',
                    extra_1: '',
                    extra_2: '',
                    extra_3: ''
                  });
                } else {
                  window.location.href = '/support/tickets';
                }
              }
            );
          } else {
            this.props.dispatch({
              type: 'FAILURE',
              messages: Array.isArray(json) ? json : [json]
            });
            this.setState({
              submit_started: false
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
    this.setState({[event.target.name]: event.target.value}, () => {
      if (this.state.url_1) {
        if (
          this.state.url_1.indexOf('http://') > -1 ||
          this.state.url_1.indexOf('https://') > -1
        ) {
          //
        } else {
          this.setState({
            url_1: 'http://' + this.state.url_1
          });
        }
      }
      if (this.state.url_2) {
        if (
          this.state.url_2.indexOf('http://') > -1 ||
          this.state.url_2.indexOf('https://') > -1
        ) {
          //
        } else {
          this.setState({
            url_2: 'http://' + this.state.url_2
          });
        }
      }
      if (this.state.url_3) {
        if (
          this.state.url_3.indexOf('http://') > -1 ||
          this.state.url_3.indexOf('https://') > -1
        ) {
          //
        } else {
          this.setState({
            url_3: 'http://' + this.state.url_3
          });
        }
      }
    });
  }

  render() {
    return (
      <div>
        <section className="page_title_bar less_padding noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Create a New Ticket</h3>
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
                        <label htmlFor="ticket_type_id">
                          Select Ticket Type:
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          id="ticket_type"
                          name="ticket_type"
                          required
                          value={this.state.ticket_type}
                          onChange={this.handleChange.bind(this)}
                        >
                          <option value="">-- Select a Ticket Type --</option>
                          {this.props.params.type == 'disputed' ? (
                            <>
                              <option value="Match Support - Match Dispute">
                                Match Support - Match Dispute
                              </option>
                              <option value="Match Dispute- Accept Loss">
                                Match Dispute- Accept Loss
                              </option>
                            </>
                          ) : (
                            <>
                              <option value="Customer Support - Account Issues">
                                Customer Support - Account Issues
                              </option>
                              <option value="Customer Support - Account Recovery">
                                Customer Support - Account Recovery
                              </option>
                              <option value="Customer Support - Dispute Account Ban">
                                Customer Support - Dispute Account Ban
                              </option>
                              <option value="Customer Support - Email Issues">
                                Customer Support - Email Issues
                              </option>
                              <option value="Customer Support - Platform User ID Issues">
                                Customer Support - Platform User ID Issues
                              </option>
                              <option value="Customer Support - Other">
                                Customer Support - Other
                              </option>
                              <option value="Customer Support - Refund Request">
                                Customer Support - Refund Request
                              </option>
                              <option value="Customer Support - Staff Report">
                                Customer Support - Staff Report
                              </option>
                              <option value="Customer Support - Staff Report User Evading a Ban">
                                Customer Support - Staff Report User Evading a
                                Ban
                              </option>
                              <option value="Customer Support - Store Issues">
                                Customer Support - Store Issues
                              </option>
                              <option value="Customer Support - Temp Migrate - Security Hold">
                                Customer Support - Temp Migrate - Security Hold
                              </option>
                              <option value="Match Support - Cancellation">
                                Match Support - Cancellation
                              </option>
                              <option value="Match Support - Lag Issue">
                                Match Support - Lag Issue
                              </option>

                              <option value="Match Support - No Show">
                                Match Support - No Show
                              </option>
                              <option value="Match Support - Opponent Cheating">
                                Match Support - Opponent Cheating
                              </option>
                              <option value="Match Support - Opponent Using Ringers">
                                Match Support - Opponent Using Ringers
                              </option>
                              <option value="Match Support - Report Free Wins">
                                Match Support - Report Free Wins
                              </option>
                              <option value="Tournament Support - Match Issues">
                                Tournament Support - Match Issues
                              </option>
                              <option value="Tournament Support - Tournament Related Questions">
                                Tournament Support - Tournament Related
                                Questions
                              </option>
                            </>
                          )}
                        </select>
                        <span className="text-white">
                          To create tickets for match disputes, please use the{' '}
                          <strong>"Create Ticket"</strong> button from the match
                          details page.
                          <br />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="ticket_title">
                          Title:
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="ticket_title"
                          name="ticket_title"
                          required
                          value={this.state.ticket_title}
                          onChange={this.handleChange.bind(this)}
                          placeholder="Enter Ticket Title"
                        />
                      </div>
                    </div>
                  </div>

                  {this.state.ticket_type == 'Match Support - Match Dispute' ||
                  this.state.ticket_type == 'Match Dispute- Accept Loss' ? (
                    <>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="extra_1">
                              Match Id
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="extra_1"
                              name="extra_1"
                              required
                              value={this.state.extra_1}
                              onChange={this.handleChange.bind(this)}
                              placeholder="Enter Match Id"
                              readOnly={
                                this.state.readonlyFields ? true : false
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="extra_3">Match Type</label>
                            <select
                              className="form-control"
                              id="extra_3"
                              name="extra_3"
                              required
                              value={this.state.extra_3}
                              onChange={this.handleChange.bind(this)}
                              disabled={
                                this.state.readonlyFields ? true : false
                              }
                            >
                              <option value="">Select</option>
                              <option value="MatchFinder">MatchFinder</option>
                              <option value="Mix-and-match">
                                Mix-and-match
                              </option>
                              <option value="Tournament">Tournament</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="extra_2">Your Team Name</label>
                            <input
                              type="text"
                              className="form-control"
                              id="extra_2"
                              name="extra_2"
                              required
                              value={this.state.extra_2}
                              onChange={this.handleChange.bind(this)}
                              placeholder="Enter Your Team Name"
                              readOnly={
                                this.state.readonlyFields ? true : false
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    false
                  )}

                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="comment">
                          Describe your issue:
                          <span className="text-danger">*</span>
                        </label>
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
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="ticket_title">URL 1:</label>
                        <input
                          type="url"
                          className="form-control"
                          id="url_1"
                          name="url_1"
                          value={this.state.url_1}
                          onChange={this.handleChange.bind(this)}
                          placeholder="Enter Reference URL 1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="ticket_title">URL 2:</label>
                        <input
                          type="url"
                          className="form-control"
                          id="url_2"
                          name="url_2"
                          value={this.state.url_2}
                          onChange={this.handleChange.bind(this)}
                          placeholder="Enter Reference URL 2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="ticket_title">URL 3:</label>
                        <input
                          type="url"
                          className="form-control"
                          id="url_3"
                          name="url_3"
                          value={this.state.url_3}
                          onChange={this.handleChange.bind(this)}
                          placeholder="Enter Reference URL 3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <input
                          type="file"
                          className="custom-file-inputs"
                          id="customFile"
                          style={{display: 'block !important'}}
                          onChange={this.handleImageUpload}
                        />
                        {this.state.upload_started ? (
                          <span className="text text-primary">
                            uploading..please wait.
                          </span>
                        ) : (
                          false
                        )}
                        {this.state.uploaded ? (
                          <span className="text text-success">
                            uploaded..please proceed with ticket submission.
                          </span>
                        ) : (
                          false
                        )}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-12 text-right">
                      <button
                        className="btn btn-blue btn-lg bttn_submit"
                        type="submit"
                        disabled={
                          this.state.upload_started ||
                          !this.state.ticket_title ||
                          this.state.submit_started
                        }
                      >
                        {this.state.submit_started
                          ? 'please wait...'
                          : 'Create Ticket'}
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
export default connect(mapStateToProps)(NewTicket);
