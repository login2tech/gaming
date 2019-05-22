// has objects
import React from 'react';
import {Translate} from 'react-localize-redux';
import {Link} from 'react-router';
import {connect} from 'react-redux';
class Footer extends React.Component {
  render() {
    return (
      <footer>
        <section className="contact-area" id="contact">
          <div className="container">
            <div className="row contact-fields">
              <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                <div className="contact-col-1 contact-inner text-center">
                  <img src="/images/logo.png" className="img-fluid" alt="" />

                  <div className="social-contacts text-center">
                    <ul>
                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.facebook_url}
                        >
                          <i className="fa fa-facebook" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.twitter_url}
                        >
                          <i className="fa fa-twitter" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.instagram_url}
                        >
                          <i className="fa fa-instagram" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          target="_blank"
                          to={this.props.settings.linkedin_url}
                        >
                          <i className="fa fa-linkedin" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                <div className="contact-col-3 contact-inner">
                  <h4>Information</h4>
                  <ul>
                    <li>
                      <Link to="/matchfinder">MatchFinder</Link>
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
              <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                <div className="contact-col-4 contact-inner">
                  <h4>SUBSCRIBE</h4>
                  <p>Please subscribe for latest game updates.</p>
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className="email"
                    name="email"
                  />
                  <input type="submit" className="sign-btn" value="Subscribe" />
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
                    <Translate id="footer_text_copyright" />
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
    settings: state.settings
  };
};

export default connect(mapStateToProps)(Footer);
