import React from 'react';
import {connect} from 'react-redux';
import {applyForStaff} from '../../actions/contact';
import Messages from '../Modules/Messages';

class ApplyForStaff extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      last_name: '',
      email: '',
      address: '',
      tel: '',
      date_of_birth: '',
      position: '',

      about_yourself: '',
      why_intested: '',
      qualification: '',
      why: ''
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.dispatch(
      applyForStaff({
        name: this.state.name,
        last_name: this.state.last_name,
        email: this.state.email,
        address: this.state.address,
        tel: this.state.tel,
        date_of_birth: this.state.date_of_birth,
        position: this.state.position,
        about_yourself: this.state.about_yourself,
        why_intested: this.state.why_intested,
        qualification: this.state.qualification,
        why: this.state.why
      })
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
                  <h4>Apply For Staff</h4>
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
                          First Name
                          <span className="required">*</span>
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
                          Last Name
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          className="form-control"
                          value={this.state.last_name}
                          onChange={this.handleChange.bind(this)}
                          autoFocus
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>
                          Email Address
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
                        <label>Address</label>

                        <input
                          type="text"
                          name="address"
                          id="address"
                          className="form-control"
                          value={this.state.address}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Phone Number</label>

                        <input
                          type="tel"
                          name="tel"
                          id="tel"
                          className="form-control"
                          value={this.state.tel}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          name="date_of_birth"
                          id="date_of_birth"
                          className="form-control"
                          value={this.state.date_of_birth}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Position</label>
                        <select
                          name="position"
                          id="position"
                          className="form-control"
                          value={this.state.position}
                          onChange={this.handleChange.bind(this)}
                        >
                          <option value="">Select</option>
                          <option value="Admininstator">Admininstator</option>
                          <option value="Tickets Support">
                            Tickets Support
                          </option>
                          <option value="Live support">Live support</option>
                          <option value="Tournament Support">
                            Tournament Support
                          </option>
                        </select>
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Tell us about you?</label>
                        <textarea
                          name="about_yourself"
                          id="about_yourself"
                          rows="7"
                          className="form-control"
                          value={this.state.about_yourself}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>
                          Why are you interested in Applying for Only Comp
                          Gaming?
                        </label>
                        <textarea
                          name="why_intested"
                          id="why_intested"
                          rows="7"
                          className="form-control"
                          value={this.state.why_intested}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Why are you qualified for the position?</label>
                        <textarea
                          name="qualification"
                          id="qualification"
                          rows="7"
                          className="form-control"
                          value={this.state.qualification}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>
                          Why should we chose you over another candidate for the
                          position?
                        </label>
                        <textarea
                          name="why"
                          id="why"
                          rows="7"
                          className="form-control"
                          value={this.state.why}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <button
                          type="submit"
                          className="btn btn-default bttn_submit"
                        >
                          Apply For Staff
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

export default connect(mapStateToProps)(ApplyForStaff);
