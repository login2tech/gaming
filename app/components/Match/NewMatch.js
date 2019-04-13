import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createMatch} from '../../actions/match';

import {Link} from 'react-router';
// import moment from 'moment';
class NewTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      ladder: '',
      games: [],
      team_info: {ladder: {title: ''}, team_users: [], title: ''},
      game_info: {title: ''},
      starts_at: new Date(new Date().getTime() + 10 * 60 * 1000),
      match_type: '',
      match_fee: 0
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  fetchGame() {
    fetch('/api/games/single/' + this.state.team_info.ladder.game_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              game_info: json.item
            },
            () => {
              // this.fetchGame();
              // this.fetchTeam();
            }
          );
        }
      });
  }
  newDate(a, b, c) {
    this.setState({
      starts_at: b
    });
  }
  componentDidMount() {
    fetch('/api/teams/single/' + this.props.params.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              team_info: json.item
            },
            () => {
              this.fetchGame();
            }
          );
        }
      });
    setTimeout(() => {
      $('#starts_at').flatpickr({
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        stepMinute: 10, //intervals of minutes
        minDate: this.state.starts_at,
        defaultDate: this.state.starts_at,
        // minDateTime: new Date(new Date().getTime() + 10 * 60 * 1000), //number of minutes
        minuteIncrement: 10,
        maxDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),

        onChange: this.newDate.bind(this)
      });
    }, 2000);
  }

  handleCreation(event) {
    event.preventDefault();
    // ();
    this.props.dispatch(
      createMatch(
        {
          team_1_id: this.props.params.id,
          game_id: this.state.game_info.id,
          ladder_id: this.state.team_info.ladder_id,
          starts_at: this.state.starts_at,
          match_type: this.state.match_type,
          match_fee: this.state.match_type == 'paid' ? this.state.match_fee : ''
        },
        this.props.user
      )
    );
  }

  isEligible() {
    if (this.state.match_type == '' || this.state.starts_at == '') {
      return false;
    }
    if (this.state.match_type == 'free') {
      return true;
    }
    if (
      this.state.match_type == 'paid' &&
      (this.state.match_fee == '' || parseFloat(this.state.match_fee) <= 0)
    ) {
      return false;
    }

    const amount = parseFloat(this.state.match_fee);
    for (let i = 0; i < this.state.team_info.team_users.length; i++) {
      if (
        parseFloat(this.state.team_info.team_users[i].user_info.cash_balance) <
        amount
      ) {
        return false;
      }
    }
    return true;
  }

  amIEligible(team_u) {
    if (this.state.match_type == '') {
      return '--';
    }
    if (this.state.match_type == 'free') {
      return <span className="text-success">Eligible</span>;
    }

    const amount = parseFloat(this.state.match_fee);

    if (parseFloat(team_u.user_info.cash_balance) < amount) {
      return <span className="text-danger">Not Eligible</span>;
    }
    return <span className="text-success">Eligible</span>;
  }
  render() {
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>New Match</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form
                    onSubmit={this.handleCreation.bind(this)}
                    autoComplete="off"
                  >
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Team</label>
                      <br />
                      <strong>{this.state.team_info.title}</strong>
                    </div>
                    <br />

                    <div className="form-group col-md-12">
                      <label htmlFor="title">Ladder</label>
                      <br />
                      <strong>
                        {this.state.game_info.title +
                          ' - ' +
                          this.state.team_info.ladder.title}
                      </strong>
                    </div>
                    <br />
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Match Settings</label>
                      <div className="input-group date">
                        <input
                          type="text"
                          id="starts_at"
                          className="form-control"
                          required=""
                          data-toggle="datetimepicker"
                          data-target="#starts_at"
                          placeholder="Match Start Date & Time"
                          name="starts_at"
                          onChange={this.handleChange.bind(this)}

                          // value={this.state.starts_at}
                          // onChange={this.handleChange.bind(this)}
                        />
                        <span className="input-group-addon">
                          <span className="glyphicon glyphicon-time" />
                        </span>
                      </div>
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor="title">Match Type</label>
                      <select
                        required
                        onChange={this.handleChange.bind(this)}
                        className="form-control"
                        name="match_type"
                        id="match_type"
                      >
                        <option value="">Select</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    {this.state.match_type == 'paid' ? (
                      <div className="form-group col-md-12">
                        <label htmlFor="match_fee">Match Entry Fee</label>
                        <input
                          type="text"
                          id="match_fee"
                          className="form-control"
                          onChange={this.handleChange.bind(this)}
                          required=""
                          data-toggle="datetimepicker"
                          data-target="#match_fee"
                          placeholder="Match Fees"
                          name="match_fee"
                        />
                      </div>
                    ) : (
                      false
                    )}
                    <div className="form-group col-md-12 text-center">
                      <button
                        disabled={!this.isEligible()}
                        className="btn btn-default bttn_submit"
                        type="submit"
                      >
                        Create Match
                      </button>
                    </div>
                  </form>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <div className="content_box">
                        <h5 className="prizes_desclaimer">
                          <i className="fa fa-users" aria-hidden="true" />{' '}
                          ROSTER
                        </h5>

                        <table className="table table-striped table-ongray table-hover">
                          <thead>
                            <tr>
                              <th>Username</th>
                              <th>Role</th>
                              <th>Eligibility</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.team_info.team_users.map(
                              (team_user, i) => {
                                return (
                                  <tr key={team_user.id}>
                                    <td>
                                      <Link
                                        to={
                                          '/u/' + team_user.user_info.username
                                        }
                                      >
                                        {team_user.user_info.username}
                                      </Link>
                                    </td>

                                    <td>
                                      {team_user.user_id ==
                                      this.state.team_info.team_creator
                                        ? 'Leader'
                                        : 'Member'}
                                    </td>
                                    <td>{this.amIEligible(team_user)}</td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};
// export default SingleThread;
export default connect(mapStateToProps)(NewTeam);
