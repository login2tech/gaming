import React from 'react';
import {connect} from 'react-redux';
import {advertiseWithUs} from '../../actions/contact';
import Messages from '../Modules/Messages';
class AdvertiseWithUs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      tel: '',
      instagram: '',
      why: '',
      you_are_a: ''
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.dispatch(
      advertiseWithUs({
        name: this.state.name,
        email: this.state.email,
        tel: this.state.tel,
        instagram: this.state.instagram,
        why: this.state.why,
        you_are_a: this.state.you_are_a
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
                  <h4>Advertise With Us</h4>
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
                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>
                          Name
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="form-control"
                          value={this.state.name}
                          required
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
                          required
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
                          required
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Instagram Username (optional)</label>

                        <input
                          type="text"
                          name="instagram"
                          id="instagram"
                          className="form-control"
                          value={this.state.instagram}
                          required
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>Are you a</label>
                        <select
                          name="you_are_a"
                          id="you_are_a"
                          className="form-control"
                          value={this.state.you_are_a}
                          onChange={this.handleChange.bind(this)}
                        >
                          <option value="">Select</option>
                          <option value="Brand">Brand</option>
                          <option value="Influencer">Influencer</option>
                          <option value="Company">Company</option>
                          <option value="Personal">Personal</option>
                        </select>
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <label>
                          Why do you want to partner with Only Comp Gaming?
                        </label>
                        <textarea
                          name="why"
                          id="why"
                          rows="7"
                          className="form-control"
                          value={this.state.why}
                          required
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>

                      <div className="form-group col-md-12 col-sm-12 co-xs-12">
                        <button
                          type="submit"
                          className="btn btn-default bttn_submit"
                        >
                          Advertise With Us
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

export default connect(mapStateToProps)(AdvertiseWithUs);
