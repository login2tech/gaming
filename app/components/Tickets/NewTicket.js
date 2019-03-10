import React from 'react';
import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';
import Messages from '../Modules/Messages';

class NewTicket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ticket_type: '',
      ticket_title: '',
      ticket_description: ''
    };
  }

  submitForm(event) {
    event.preventDefault();
    // fetch(, function(){

    fetch('/api/tickets/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ticket_type: this.state.ticket_type,
        ticket_title: this.state.ticket_title,
        ticket_description: this.state.ticket_description
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
                window.location.href = '/support/tickets';
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
                          * Select Ticket Type:
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
                          <option value="Customer Support - Gamertag Issues">
                            Customer Support - Gamertag Issues
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
                            Customer Support - Staff Report User Evading a Ban
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
                          <option value="Match Support - Match Dispute">
                            Match Support - Match Dispute
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
                            Tournament Support - Tournament Related Questions
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
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
                          placeholder="Enter Ticket Title"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="comment">* Describe your issue:</label>
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
                  <hr />
                  <div className="row">
                    <div className="col-md-12 text-right">
                      <button
                        className="btn btn-blue btn-lg bttn_submit"
                        type="submit"
                      >
                        Create Ticket
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
