import React from 'react';
import {connect} from 'react-redux';
import {submitContactForm} from '../../actions/contact';
import Messages from '../Modules/Messages';
import {Translate} from 'react-localize-redux';

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
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h2 className="title_heading">
                  <Translate id="contact_page_heading" />
                </h2>
              </div>
            </div>
          </div>
        </section>

        <section className="mid_part_content">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="inner-column">
                  <div className="contact-form">
                    <Messages messages={this.props.messages} />
                    <form
                      onSubmit={this.handleSubmit.bind(this)}
                      className="form-horizontal"
                      id="contact-form"
                    >
                      <div className="row clearfix">
                        <div className="form-group col-md-6 col-sm-6 co-xs-12">
                          <label>
                            <Translate id="contact_page_name_label" />{' '}
                            <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={this.state.name}
                            onChange={this.handleChange.bind(this)}
                            autoFocus
                          />
                        </div>
                        <div className="form-group col-md-6 col-sm-6 co-xs-12">
                          <label>
                            <Translate id="contact_page_email_label" />{' '}
                            <span className="required">*</span>
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
                          <label>
                            <Translate id="contact_page_subject_label" />
                          </label>
                          <select
                            name="subject"
                            id="subject"
                            value={this.state.subject}
                            onChange={this.handleChange.bind(this)}
                          >
                            <option value="Question (s) about the service">
                              Question (s) about the service
                            </option>
                            <option value="Technical question">
                              Technical question
                            </option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        <div className="form-group col-md-12 col-sm-12 co-xs-12">
                          <label>
                            <Translate id="contact_page_message_label" />{' '}
                          </label>
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
                            className="theme-btn btn-style-one"
                          >
                            <Translate id="contact_page_send_btn_label" />
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
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Contact);
