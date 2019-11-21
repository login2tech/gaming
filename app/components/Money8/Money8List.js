import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
import game_user_ids from '../../../config/game_user_ids';

// import Messages from '../Modules/Messages';

class Money8List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      matches: [],
      ladder: '',
      games: [],
      is_loaded: false
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  componentDidMount() {
    fetch('/api/money8/upcoming')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              matches: json.items
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
              <div className="col">
                <div className="all_t_heading">
                  Upcoming Mix and Match Matches
                </div>
                <div className="t_big_heading">Play. Win. Collect.</div>

                <Link
                  to={'/mix-and-match/new/'}
                  className="btn btn-default bttn_submit max-width-300"
                >
                  Create a mix-and-match pool
                </Link>
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
                    {this.state.is_loaded && this.state.matches.length < 1 ? (
                      <div className="alert alert-warning">
                        There are no active mix-and-match matches. Please check
                        back later or start a new match
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
                      {this.state.matches.map((match, id) => {
                        return (
                          <li
                            key={match.id}
                            className="tournament-box"
                            style={{background: '#27204d'}}
                          >
                            <div className="tournament-body">
                              <Link
                                to={this.matchLink(
                                  '/mix-and-match/' + match.id
                                )}
                                className="tournament-name text-white"
                              >
                                <span
                                  className={
                                    game_user_ids.tag_icons[
                                      match.ladder.gamer_tag
                                    ]
                                  }
                                />
                                {match.game.title} - {match.ladder.title}
                              </Link>

                              <span className="date">
                                {match.players_joined}/{match.players_total}{' '}
                                have joined
                              </span>
                            </div>

                            <div className="tournament-footer">
                              <div className="row">
                                <div className="col-6 col-md-3 t-col">
                                  <h5>Status</h5>
                                  <p>{match.status}</p>
                                </div>
                                <div className="col-6 col-md-2 t-col">
                                  <h5>TYPE</h5>
                                  <p>
                                    {match.match_type == 'free' ? (
                                      'FREE'
                                    ) : (
                                      <span>
                                        {'PAID (' + match.match_type + ')'}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div className="col-6 col-md-2 t-col">
                                  <h5>Prize pool</h5>
                                  <p>
                                    {match.match_type != 'free'
                                      ? '' +
                                        match.match_fee +
                                        ' ' +
                                        (match.match_type == 'cash'
                                          ? 'OCG Cash'
                                          : 'Credits')
                                      : '--'}
                                  </p>
                                </div>
                                <div className="col-6 col-md-2 t-col">
                                  <h5>Players</h5>
                                  <p>
                                    {match.players_total / 2}
                                    <small> v </small>
                                    {match.players_total / 2}
                                  </p>
                                </div>
                                <div className="col-6 col-md-3 t-col">
                                  <h5>EXPIRES</h5>
                                  <p>{moment(match.expires_in).fromNow()}</p>
                                </div>
                              </div>

                              <div className="col align-right">
                                <Link
                                  to={this.matchLink(
                                    '/mix-and-match/' + match.id
                                  )}
                                  className="btn-default"
                                >
                                  Join Pool
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
export default connect(mapStateToProps)(Money8List);
