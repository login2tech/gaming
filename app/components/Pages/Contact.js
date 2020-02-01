import React from 'react';
import {connect} from 'react-redux';
import {submitContactForm} from '../../actions/contact';
import Messages from '../Modules/Messages';
// import {Translate} from 'react-localize-redux';

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: '', email: '', subject: '', message: ''};
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.dispatch(
      submitContactForm(
        this.state.name,
        this.state.email,
        this.state.subject,
        this.state.message
      )
    );
  }

  render() {
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="authorize_box">
                <div className="title_default_dark title_border text-center">
                  <h4>Contact Us</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form
                    onSubmit={this.handleSubmit.bind(this)}
                    className="form-horizontal"
                    id="contact-form"
                  >
                    <div className="row clearfix">
                      <div className="form-group col-md-6 col-sm-6 co-xs-12">
                        <label>
                          Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="form-control"
                          value={this.state.name}
                          onChange={this.handleChange.bind(this)}
                          autoFocus
                        />
                      </div>
                      <div className="form-group col-md-6 col-sm-6 co-xs-12">
                        <label>
                          Email Address <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="form-control"
                          value={this.state.email}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Subject</label>

                        <input
                          type="text"
                          name="subject"
                          id="subject"
                          className="form-control"
                          value={this.state.subject}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Message </label>
                        <textarea
                          name="message"
                          id="message"
                          rows="7"
                          className="form-control"
                          value={this.state.message}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <button
                          type="submit"
                          className="btn btn-default bttn_submit"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
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
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Contact);
