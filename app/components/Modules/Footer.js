// has objects
import React from 'react';
// import {Translate} from 'react-localize-redux';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {applySubscribe} from '../../actions/contact';
import Messages from './Messages';
class Footer extends React.Component {
  state = {email: ''};

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  doneT(st) {
    if (st) {
      this.setState({
        form_submitted: true,
        subsribed_y: true
      });
    }
  }
  handleSubmit(event) {
    event.preventDefault();
    this.props.dispatch(
      applySubscribe(
        {
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
        },
        this.doneT.bind(this)
      )
    );
  }

  render() {
    return (
      <footer>
        <section className="contact-area" id="contact">
          <div className="container">
            <div className="row contact-fields">
              <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                <div className="contact-col-1 contact-inner text-center">
                  <img src="/images/logo.png" className="img-fluid" alt="" />

                  <div className="social-contacts text-center">
                    <ul>
                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.facebook_url}
                        >
                          <i className="fab fa-facebook" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.youtube_url}
                        >
                          <i className="fab fa-youtube" />
                        </Link>
                      </li>

                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.instagram_url}
                        >
                          <i className="fab fa-instagram" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.linkedin_url}
                        >
                          <i className="fab fa-linkedin" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-lg-2 col-md-3 col-sm-6 col-xs-12">
                <div className="contact-col-3 contact-inner">
                  <h4>Information</h4>
                  <ul>
                    <li>
                      <Link to="/matchfinder">Matchfinder</Link>
                    </li>
                    <li>
                      <Link to="/tournaments">Tournaments </Link>
                    </li>
                    <li>
                      <Link to="/apply-for-staff">Apply For Staff</Link>
                    </li>
                    <li>
                      <Link to="/advertise-with-us">Advertise with us</Link>
                    </li>
                    <li>
                      <Link to="/p/about">About Us</Link>
                    </li>
                    <li>
                      <Link to="/contact">Contact </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-3 col-sm-6 col-xs-12">
                <div className="contact-col-3 contact-inner">
                  <h4>Support</h4>
                  <ul>
                    <li>
                      <Link to="/support/tickets">Ticket Center</Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          tidioChatApi && tidioChatApi.open();
                        }}
                      >
                        Live Support Chat
                      </Link>
                    </li>
                    <li>
                      <Link to="/faq">FAQs</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                <img src="/images/payments.png" alt="accepted payment" />
              </div>

              <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                <div className="contact-col-4 contact-inner">
                  <h4>SUBSCRIBE</h4>
                  <p>Please subscribe for latest game updates.</p>
                  {this.state.subsribed_y ? (
                    <Messages messages={this.props.messages} />
                  ) : (
                    false
                  )}
                  {this.state.form_submitted ? (
                    false
                  ) : (
                    <form onSubmit={this.handleSubmit.bind(this)}>
                      <input
                        type="email"
                        placeholder="Enter Email Address"
                        className="email"
                        name="email"
                        value={this.state.email}
                        onChange={this.handleChange.bind(this)}
                      />
                      <input
                        type="submit"
                        className="sign-btn"
                        value="Subscribe"
                      />
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 text-center">
                <div className="copyright">
                  <p>
                    &copy; 2020 Only Comp Gaming
                    <br />
                    <small>
                      Only Comp Gaming is not endorsed by, directly affiliated with, maintained or sponsored by Activision Blizzard, Take-Two Interactive, Apple Inc, Electronic Arts, Microsoft, Sony, Xbox, Playstation or Epic Games. All content, games titles, trade names and/or trade dress, trademarks, artwork and associated imagery are trademarks and/or copyright material of their respective owners.
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Footer);
