import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createMatch} from '../../actions/match';

import {Link} from 'react-router';
import moment from 'moment';
class NewTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      ladder: '',
      games: [],
      team_info: {ladder: {}, team_users: []},
      game_info: {}
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
    setTimeout(function() {
      $('#starts_at').datetimepicker({
        icons: {
          time: 'glyphicon glyphicon-time',
          date: 'glyphicon glyphicon-calendar',
          up: 'glyphicon glyphicon-chevron-up',
          down: 'glyphicon glyphicon-chevron-down',
          previous: 'glyphicon glyphicon-chevron-left',
          next: 'glyphicon glyphicon-chevron-right',
          today: 'glyphicon glyphicon-screenshot',
          clear: 'glyphicon glyphicon-trash',
          close: 'glyphicon glyphicon-remove'
        }
        // controlType: 'select',
        // timeFormat: 'hh:mm tt',
        // stepMinute: 10, //intervals of minutes
        // minDate: new Date(new Date().getTime() + 10 * 60 * 1000),
        // minDateTime: new Date(new Date().getTime() + 10 * 60 * 1000), //number of minutes
        // maxDateTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) //number of days
      });
    }, 1000);
  }

  handleCreation(event) {
    event.preventDefault();
    // ();
    this.props.dispatch(
      createMatch(
        {title: this.state.title, ladder: this.state.ladder},
        this.props.user
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
                  <h4>New Match</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form onSubmit={this.handleCreation.bind(this)}>
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Team</label>
                      <input
                        type="text"
                        className="form-control hasDatepicker"
                        required=""
                        readOnly
                        // placeholder="Match Start Date & Time"
                        name="team_id"
                        value={this.state.team_info.title}
                        onChange={this.handleChange.bind(this)}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Ladder</label>
                      <input
                        type="text"
                        className="form-control hasDatepicker"
                        required=""
                        placeholder="Match Start Date & Time"
                        name="starts_at"
                        value={
                          this.state.game_info.title +
                          ' - ' +
                          this.state.team_info.ladder.title
                        }
                        onChange={this.handleChange.bind(this)}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor="title">Match Settings</label>
                      <input
                        type="text"
                        id="starts_at"
                        className="form-control hasDatepicker"
                        required=""
                        placeholder="Match Start Date & Time"
                        name="starts_at"
                        value={this.state.title}
                        onChange={this.handleChange.bind(this)}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor="title">Match Type</label>
                      <select required className="form-control">
                        <option value="">Select</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    <div className="form-group col-md-12 text-center">
                      <button
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
                              <th>Date Joined</th>
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
                                    <td>
                                      {team_user.accepted
                                        ? moment(team_user.created_at).format(
                                            'lll'
                                          )
                                        : 'Not Yet'}
                                    </td>
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
