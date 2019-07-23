import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {signup} from '../../actions/auth';
// import {facebookLogin} from '../../actions/oauth';
import Messages from '../Modules/Messages';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      day: '',
      month: '',
      year: '',
      password: '',
      password_confirm: ''
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSignup(event) {
    event.preventDefault();
    this.props.dispatch(
      signup(
        {
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          username: this.state.username,
          dob:
            '' +
            this.state.day +
            '/' +
            this.state.month +
            '/' +
            this.state.year,
          email: this.state.email,
          password: this.state.password,
          password_confirm: this.state.password_confirm
        },
        () => {
          this.state = {
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            day: '',
            month: '',
            year: '',
            password: '',
            password_confirm: ''
          };
        }
      )
    );
    const element = document.body;
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  // handleFacebook() {
  //   this.props.dispatch(facebookLogin(this.props.settings.facebook_public_key));
  // }
  //
  // componentDidMount() {
  //   document.body.classList.add('bg_login');
  //   document.body.classList.add('align');
  // }
  //
  // componentWillUnmount() {
  //   document.body.classList.remove('bg_login');
  //   document.body.classList.remove('align');
  // }

  render() {
    return (
      <section className="middle_part_login" id="tab-block">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="authorize_box">
                <div className="title_default_dark title_border text-center">
                  <h4>Create Account</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form onSubmit={this.handleSignup.bind(this)}>
                    <div className="row ">
                      <div className="form-group col-md-6 ">
                        <input
                          type="text"
                          className="form-control"
                          required=""
                          placeholder="Enter First Name"
                          id="first_name"
                          name="first_name"
                          value={this.state.first_name}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                      <div className="form-group col-md-6 ">
                        <input
                          type="text"
                          className="form-control"
                          required=""
                          placeholder="Enter Last Name"
                          id="last_name"
                          name="last_name"
                          value={this.state.last_name}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                      <div className="form-group col-md-12">
                        <input
                          type="text"
                          className="form-control"
                          required=""
                          placeholder="Enter your username"
                          id="username"
                          name="username"
                          value={this.state.username}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                      <div className="form-group col-md-12">
                        <input
                          type="email"
                          className="form-control"
                          required=""
                          placeholder="Enter Email Address"
                          id="email"
                          name="email"
                          value={this.state.email}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                      <div className="container">
                        <div className="row dobrow">
                          <div className="col-sm-4">
                            <div className="form-group">
                              <select
                                className="form-control"
                                id="month"
                                name="month"
                                required
                                value={this.state.month}
                                onChange={this.handleChange.bind(this)}
                              >
                                <option value="" selected="" disabled="">
                                  Birth Month
                                </option>
                                <option value="1">January</option>
                                <option value="2">Febuary</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className="form-group">
                              <select
                                className="form-control"
                                id="day"
                                name="day"
                                required
                                value={this.state.day}
                                onChange={this.handleChange.bind(this)}
                              >
                                >
                                <option value="" selected="" disabled="">
                                  Birth Day
                                </option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                                <option value="13">13</option>
                                <option value="14">14</option>
                                <option value="15">15</option>
                                <option value="16">16</option>
                                <option value="17">17</option>
                                <option value="18">18</option>
                                <option value="19">19</option>
                                <option value="20">20</option>
                                <option value="21">21</option>
                                <option value="22">22</option>
                                <option value="23">23</option>
                                <option value="24">24</option>
                                <option value="25">25</option>
                                <option value="26">26</option>
                                <option value="27">27</option>
                                <option value="28">28</option>
                                <option value="29">29</option>
                                <option value="30">30</option>
                                <option value="31">31</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className="form-group">
                              <select
                                className="form-control"
                                id="year"
                                name="year"
                                required
                                value={this.state.year}
                                onChange={this.handleChange.bind(this)}
                              >
                                >
                                <option value="" selected="" disabled="">
                                  Birth Year
                                </option>
                                <option value="2019">2019</option>
                                <option value="2018">2018</option>
                                <option value="2017">2017</option>
                                <option value="2016">2016</option>
                                <option value="2015">2015</option>
                                <option value="2014">2014</option>
                                <option value="2013">2013</option>
                                <option value="2012">2012</option>
                                <option value="2011">2011</option>
                                <option value="2010">2010</option>
                                <option value="2009">2009</option>
                                <option value="2008">2008</option>
                                <option value="2007">2007</option>
                                <option value="2006">2006</option>
                                <option value="2005">2005</option>
                                <option value="2004">2004</option>
                                <option value="2003">2003</option>
                                <option value="2002">2002</option>
                                <option value="2001">2001</option>
                                <option value="2000">2000</option>
                                <option value="1999">1999</option>
                                <option value="1998">1998</option>
                                <option value="1997">1997</option>
                                <option value="1996">1996</option>
                                <option value="1995">1995</option>
                                <option value="1994">1994</option>
                                <option value="1993">1993</option>
                                <option value="1992">1992</option>
                                <option value="1991">1991</option>
                                <option value="1990">1990</option>
                                <option value="1989">1989</option>
                                <option value="1988">1988</option>
                                <option value="1987">1987</option>
                                <option value="1986">1986</option>
                                <option value="1985">1985</option>
                                <option value="1984">1984</option>
                                <option value="1983">1983</option>
                                <option value="1982">1982</option>
                                <option value="1981">1981</option>
                                <option value="1980">1980</option>
                                <option value="1979">1979</option>
                                <option value="1978">1978</option>
                                <option value="1977">1977</option>
                                <option value="1976">1976</option>
                                <option value="1975">1975</option>
                                <option value="1974">1974</option>
                                <option value="1973">1973</option>
                                <option value="1972">1972</option>
                                <option value="1971">1971</option>
                                <option value="1970">1970</option>
                                <option value="1969">1969</option>
                                <option value="1968">1968</option>
                                <option value="1967">1967</option>
                                <option value="1966">1966</option>
                                <option value="1965">1965</option>
                                <option value="1964">1964</option>
                                <option value="1963">1963</option>
                                <option value="1962">1962</option>
                                <option value="1961">1961</option>
                                <option value="1960">1960</option>
                                <option value="1959">1959</option>
                                <option value="1958">1958</option>
                                <option value="1957">1957</option>
                                <option value="1956">1956</option>
                                <option value="1955">1955</option>
                                <option value="1954">1954</option>
                                <option value="1953">1953</option>
                                <option value="1952">1952</option>
                                <option value="1951">1951</option>
                                <option value="1950">1950</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="form-group col-md-12">
                        <input
                          type="password"
                          className="form-control"
                          required=""
                          placeholder="Enter Password"
                          name="password"
                          id="password"
                          value={this.state.password}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                      <div className="form-group col-md-12">
                        <input
                          type="password"
                          className="form-control"
                          required=""
                          placeholder="Confirm Password"
                          name="password_confirm"
                          id="password_confirm"
                          value={this.state.password_confirm}
                          onChange={this.handleChange.bind(this)}
                        />
                      </div>
                    </div>
                    <div className="form-group col-md-12">
                      <div className="checkbox_field d-inline">
                        <input
                          required
                          type="checkbox"
                          name="rememberme"
                          id="rememberme"
                          value="rememberme"
                        />
                        <label htmlFor="rememberme">
                          {' '}
                          I agree with{' '}
                          <Link to="/p/terms">Terms of Services</Link>
                        </label>
                      </div>
                    </div>
                    <div className="form-group col-md-12 text-center">
                      <button
                        className="btn btn-default btn-radius bttn_submit"
                        type="submit"
                      >
                        Submit
                      </button>
                    </div>
                    <p className="text-center foo_login">
                      <Link href="/login">
                        Already member? Sign In{' '}
                        <i
                          className="fa fa-long-arrow-right m-l-5"
                          aria-hidden="true"
                        />
                      </Link>
                    </p>
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
    messages: state.messages,
    settings: state.settings
  };
};

export default connect(mapStateToProps)(Signup);
