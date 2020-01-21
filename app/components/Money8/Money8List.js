import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
import game_user_ids from '../../../config/game_user_ids';
import {leave_match} from '../../actions/match8';

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

  initCancel(match) {
    this.props.dispatch(
      leave_match(
        {
          match_id: match.id
        },
        this.props.user
      )
    );
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
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col">
                <div className="all_t_heading">
                  Upcoming Mix & Match Matches
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
                        let btn_lbl = 'Join Pool';
                        let show_cancel = false;
                        if (match.players_joined >= match.players_total) {
                          // return false;
                        } else {
                          const me = this.props.user.id;
                          const users = JSON.parse(match.players);
                          for (let i = 0; i < users.length; i++) {
                            // console.log(users[i] , me)
                            if (users[i] == me) {
                              show_cancel = true;
                              btn_lbl = 'View Pool';
                              break;
                            }
                          }
                        }
                        return (
                          <li
                            key={match.id}
                            className="tournament-box"
                            style={{
                              backgroundImage: match.game.banner_url
                                ? 'url(' + match.game.banner_url + ')'
                                : "url('images/thumbnail_tournament.jpg')"
                            }}
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
                                          ? '$'
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

                              <div
                                className="col align-right"
                                style={{
                                  flexDirection: 'column',
                                  alignItems: 'flex-end'
                                }}
                              >
                                <Link
                                  to={this.matchLink(
                                    '/mix-and-match/' + match.id
                                  )}
                                  className="btn-default"
                                >
                                  {btn_lbl}
                                </Link>
                                {show_cancel ? (
                                  this.state.show_cancel_init ? (
                                    <div>
                                      <button
                                        onClick={() => {
                                          this.initCancel(match);
                                        }}
                                        className="btn-danger btn cnclMt width-auto"
                                      >
                                        SURE?
                                      </button>
                                      <button
                                        onClick={() => {
                                          this.setState({
                                            show_cancel_init: false
                                          });
                                        }}
                                        className="btn-danger btn cnclMt width-auto"
                                      >
                                        x
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        this.setState({
                                          show_cancel_init: true
                                        });
                                      }}
                                      className="btn-danger btn cnclMt"
                                    >
                                      Cancel Match
                                    </button>
                                  )
                                ) : (
                                  false
                                )}
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
