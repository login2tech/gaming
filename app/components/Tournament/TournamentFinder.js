import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');

// import Messages from '../Modules/Messages';

class TournamentFinder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      tournaments: [],
      ladder: '',
      games: [],
      is_loaded: false
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  componentDidMount() {
    fetch('/api/tournaments/upcoming')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              tournaments: json.items
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

  render() {
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="all_t_heading">Upcoming Matches</div>
                <div className="t_big_heading">Play. Win. Collect.</div>

                {/*<Link
                  to={'/matchfinder/new/ '}
                  className="btn btn-default bttn_submit"
                >
                  Create a match
                </Link>
                */}
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="content">
                  <div id="tab1_content" className="content_boxes selected">
                    {this.state.is_loaded &&
                    this.state.tournaments.length < 1 ? (
                      <div className="alert alert-warning">
                        There are no active tournaments. Please check back
                        later.
                      </div>
                    ) : (
                      false
                    )}
                    {!this.state.is_loaded ? (
                      <div className="text-center">
                        <span className="fa fa-spin fa-spinner" />
                      </div>
                    ) : (
                      false
                    )}

                    <ul
                      id="upcoming-tournament"
                      className="tournament-list active"
                    >
                      {this.state.tournaments.map((match, id) => {
                        return (
                          <li
                            key={match.id}
                            className="tournament-box"
                            style={{
                              backgroundImage:
                                "url('images/thumbnail_tournament.jpg')"
                            }}
                          >
                            <div className="tournament-body">
                              <Link
                                to={this.matchLink('/t/' + match.id)}
                                className="tournament-name"
                              >
                                {match.game.title} - {match.ladder.title}
                              </Link>

                              <span className="date">
                                {moment(match.registration_start_at).isAfter(
                                  moment()
                                )
                                  ? 'Registration starts ' +
                                    moment(
                                      match.registration_start_at
                                    ).fromNow()
                                  : 'Registration ends ' +
                                    moment(match.registration_end_at).fromNow()}
                              </span>

                              <span className="date">
                                Tournament Starts{' '}
                                {moment(match.starts_at).fromNow()}
                              </span>
                            </div>

                            <div className="tournament-footer">
                              <div className="col">
                                <div className="col-item">
                                  <h5>Registered</h5>
                                  <p>
                                    {match.teams_registered
                                      ? match.teams_registered
                                      : 0}
                                    {' / ' + match.total_teams}
                                  </p>
                                </div>
                                <div className="col-item">
                                  <h5>entry_fee</h5>
                                  <p>${match.entry_fee}</p>
                                </div>
                                <div className="col-item">
                                  <h5>Prize pool</h5>
                                  <p>
                                    $
                                    {match.first_winner_price +
                                      match.second_winner_price +
                                      match.third_winner_price}
                                  </p>
                                </div>
                              </div>

                              <div className="col align-right">
                                <Link
                                  to={this.matchLink('/t/' + match.id)}
                                  className="btn-default"
                                >
                                  Join Tournament
                                </Link>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
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
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};
// export default SingleThread;
export default connect(mapStateToProps)(TournamentFinder);
