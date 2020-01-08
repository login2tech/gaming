import React from 'react';
import {connect} from 'react-redux';
import {resetPassword} from '../../actions/auth';
import Messages from '../Modules/Messages';

class Reset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {password: '', confirm: ''};
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleReset(event) {
    event.preventDefault();
    this.props.dispatch(
      resetPassword(
        this.state.password,
        this.state.confirm,
        this.props.params.token
      )
    );
  }

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
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="authorize_box shadow">
                <div className="title_default_dark title_border text-center">
                  <h4>Reset Password</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form onSubmit={this.handleReset.bind(this)}>
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
                        name="confirm"
                        id="confirm"
                        value={this.state.passwconfirmord}
                        onChange={this.handleChange.bind(this)}
                      />
                    </div>
                    <div className="form-group col-md-12 text-center">
                      <button
                        className="btn btn-default bttn_submit"
                        type="submit"
                      >
                        Reset Password
                      </button>
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
  return state;
};

export default connect(mapStateToProps)(Reset);
