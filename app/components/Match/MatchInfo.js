import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');

// import Messages from '../Modules/Messages';

class MatchInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      match: {
        game: {},
        ladder: {},
        team_1_info: {team_users: []},
        team_2_info: {team_users: []}
      },
      ladder: '',
      games: []
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  agreeToTermsForMatchJoin(event) {
    event.preventDefault();
    // diptach
  }

  isEligible() {
    if (this.state.match.match_type == '' || this.state.match.starts_at == '') {
      return false;
    }
    if (this.state.match_type == 'free') {
      return true;
    }
    if (
      this.state.match.match_type == 'paid' &&
      (this.state.match.match_fee == '' ||
        parseFloat(this.state.match.match_fee) <= 0)
    ) {
      return false;
    }

    const amount = parseFloat(this.state.match.match_fee);
    for (let i = 0; i < this.state.team_selected.team_users.length; i++) {
      if (
        parseFloat(
          this.state.team_selected.team_users[i].user_info.cash_balance
        ) < amount
      ) {
        return false;
      }
    }
    return true;
  }

  amIEligible(team_u) {
    if (this.state.match.match_type == '') {
      return '--';
    }
    if (this.state.match.match_type == 'free') {
      return <span className="text-success">Eligible</span>;
    }

    const amount = parseFloat(this.state.match.match_fee);

    if (parseFloat(team_u.user_info.cash_balance) < amount) {
      return <span className="text-danger">Not Eligible</span>;
    }
    return <span className="text-success">Eligible</span>;
  }

  componentDidMount() {
    fetch('/api/matches/single/' + this.props.params.match_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              match: json.item
            },
            () => {
              // this.fetchTeams();
            }
          );
        }
      });
  }

  matchLink(orign) {
    if (this.props.user) {
      return orign;
    }
    return '/login';
  }

  showMatch() {
    fetch(
      '/api/teams/team_of_user/?uid=' +
        this.props.user.id +
        '&filter_ladder=' +
        this.state.match.ladder_id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              // is_loaded: true,
              eligible_teams: json.teams,
              eligible_teams_loaded: true
            },
            () => {
              // scroll
              const element = document.getElementById('tlst');
              if (element) {
                element.scrollIntoView({
                  behavior: 'smooth',
                  block: 'end',
                  inline: 'nearest'
                });
              }
            }
          );
        }
      });
  }

  renderJoin() {
    if (this.state.match.team_2_id) {
      return false;
    }
    // return false;
    const me = this.props.user.id;
    const users = this.state.match.team_1_info.team_users;

    for (let i = 0; i < users.length; i++) {
      if (users[i].id == me) {
        return false;
      }
    }
    return (
      <button
        type="button"
        onClick={() => {
          this.showMatch();
        }}
        className="btn btn-default bttn_submit"
      >
        Join Match
      </button>
    );
  }

  render() {
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <div className="match_heading">
                    <h4>Match</h4>
                  </div>
                  <span className="vs_match">
                    <Link to={'/teams/view/' + this.state.match.team_1_info.id}>
                      {this.state.match.team_1_info.title}
                    </Link>{' '}
                    VS{' '}
                    {this.state.match.team_2_id ? (
                      <Link
                        to={'/teams/view/' + this.state.match.team_2_info.id}
                      >
                        {this.state.match.team_2_info.title}
                      </Link>
                    ) : (
                      false
                    )}
                  </span>
                  <span className="game_station">
                    {this.state.match.game.title} @{' '}
                    {this.state.match.ladder.title}
                  </span>
                  <div className="match_start_date">
                    Match Starts:{' '}
                    {moment(this.state.match.starts_at).format('lll')} ({' '}
                    {moment(this.state.match.starts_at).fromNow()} )
                  </div>
                  <div className="twovstwo">1 VS 1 MATCH</div>
                  {/* // <div className="match_end_date">// // </div> */}
                  {/* <div className="rules_point">
                    <ul>
                      <li>
                        <a href="#">View Rules</a>
                      </li>
                    </ul>
                  </div> */}
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4">
                        <span> MATCH ID</span>
                        <p>#{this.state.match.id}</p>
                      </div>

                      <div className="col-md-4">
                        <span> STATUS</span>
                        <p>{this.state.match.status}</p>
                      </div>

                      <div className="col-md-4">
                        <span>TYPE</span>
                        <p>
                          {this.state.match.match_type == 'paid'
                            ? 'CASHOUT'
                            : 'LADDER'}
                        </p>
                      </div>
                    </div>
                    {this.renderJoin()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                {/*}   <h5 className="prizes_desclaimer">Match Rules</h5>
                <div className="list_pad">
                <div className="row">
                   <div className="col-md-6">
                      <span>HOST</span>
                      <p>
                        ound 1: TBD
                        <br />
                        Round 2: TBD
                        <br />
                        Round 3: TBD
                      </p>
                    </div>

                    <div className="col-md-6">
                      <span> Maps</span>
                      <p>
                        Round 1: Battle Royale
                        <br />
                        Round 2: Battle Royale
                        <br />
                        Round 3: Battle Royale
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <span>MATCH SET</span>
                      <p>Best Of 3</p>
                    </div>

                    <div className="col-md-6">
                      <span> GAME TYPE</span>
                      <p>Battle Royale</p>
                    </div>
                  </div>
                </div>

                <hr />

                <h5 className="prizes_desclaimer">Match Options</h5>

                <div className="list_pad">
                  <div className="row">
                    <div className="col-md-6">
                      <span>DETAILS</span>
                      <p>Game Mode - Battle Royale</p>
                    </div>

                    <div className="col-md-6" />
                  </div>
                </div>
                <hr />
                */}

                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-users" aria-hidden="true" /> ROSTER
                  </h5>
                  <br />

                  <h6 className="prizes_desclaimer">
                    {this.state.match.team_1_info.title}
                  </h6>
                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.match.team_1_info.team_users.map(
                        (team_user, i) => {
                          return (
                            <tr key={team_user.id}>
                              <td>
                                <Link to={'/u/' + team_user.user_info.username}>
                                  {team_user.user_info.username}
                                </Link>
                              </td>

                              <td>
                                {team_user.user_id ==
                                this.state.match.team_1_info.team_creator
                                  ? 'Leader'
                                  : 'Member'}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>

                  <br />
                  {this.state.match.team_2_id ? (
                    <div>
                      <h6 className="prizes_desclaimer">
                        {this.state.match.team_2_info.title}
                      </h6>
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.match.team_2_info.team_users.map(
                            (team_user, i) => {
                              return (
                                <tr key={team_user.id}>
                                  <td>
                                    <Link
                                      to={'/u/' + team_user.user_info.username}
                                    >
                                      {team_user.user_info.username}
                                    </Link>
                                  </td>

                                  <td>
                                    {team_user.user_id ==
                                    this.state.match.team_2_info.team_creator
                                      ? 'Leader'
                                      : 'Member'}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    false
                  )}
                </div>
                <br />
                {this.renderJoin()}
                <br />

                {this.state.team_selected ? (
                  <div>
                    <button
                      className="  btn btn-primary btn-sm max-width-300"
                      onClick={() => {
                        this.setState({
                          team_selected: false
                        });
                      }}
                    >
                      <i className="fa fa-arrow-left" /> back to team list
                    </button>
                    <br />
                    <form
                      onSubmit={event => {
                        this.agreeToTermsForMatchJoin(event);
                      }}
                    >
                      <h6 className="prizes_desclaimer">
                        {this.state.team_selected.title} - Rooster
                      </h6>
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Eligibility</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.team_selected.team_users.map(
                            (team_user, i) => {
                              return (
                                <tr key={team_user.id}>
                                  <td>
                                    <Link
                                      to={'/u/' + team_user.user_info.username}
                                    >
                                      {team_user.user_info.username}
                                    </Link>
                                  </td>

                                  <td>
                                    {team_user.user_id ==
                                    this.state.team_selected.team_creator
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
                      <br />
                      <label>
                        <input type="checkbox" required /> I agree to the terms
                        to join this match.
                      </label>
                      <br />
                      <br />
                      <input
                        type="submit"
                        disabled={!this.isEligible.bind(this)}
                        className="btn btn-primary max-width-300"
                        value={'Join Match'}
                      />
                    </form>
                  </div>
                ) : (
                  false
                )}

                <ul className="team_list" id="tlst">
                  {this.state.eligible_teams_loaded &&
                    !this.state.team_selected &&
                    this.state.eligible_teams.map((team_parent, i) => {
                      if (
                        team_parent.team_info.ladder_id !=
                        this.state.match.ladder_id
                      ) {
                        return false;
                      }
                      const team = team_parent.team_info
                        ? team_parent.team_info
                        : {};
                      return (
                        <li className="" key={team.id}>
                          <Link
                            // to={
                            //   '/u/' +
                            //   this.state.user_info.username +
                            //   '/teams/' +
                            //   team.id
                            // }
                            onClick={() => {
                              this.setState({
                                team_selected: team
                              });
                            }}
                          >
                            <img src="/images/team_bg.png" />
                            <div className="info">{team.title}</div>
                          </Link>
                        </li>
                      );
                    })}
                  {this.state.eligible_teams_loaded &&
                    !this.state.team_selected && (
                      <li>
                        <a
                          target="_blank"
                          href={'/u/' + this.props.user.username + '/teams/new'}
                        >
                          <img src="/images/team_new.png" />
                        </a>
                      </li>
                    )}
                </ul>
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
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};
// export default SingleThread;
export default connect(mapStateToProps)(MatchInfo);
