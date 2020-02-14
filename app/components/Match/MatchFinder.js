import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
// const moment = require('moment');
// import game_user_ids from '../../../config/game_user_ids';
import {leave_match} from '../../actions/match';
import SingleMatch from './SingleMatch';
// import Messages from '../Modules/Messages';

class MatchFinder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      matches: {},
      ladder: '',
      games: [],
      is_loaded: false,
      total_upcoming: 0
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  componentDidMount() {
    let str = '';
    if (this.props.params && this.props.params.id) {
      str = '?&filter_id=' + this.props.params.id;
    }
    fetch('/api/matches/upcoming' + str)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              matches: json.items,
              total_upcoming: json.total_upcoming
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

  initCancel(match) {
    this.props.dispatch(
      leave_match(
        {
          match_id: match.id,
          do_cancel: false,
          team: match.team_1_id
        },
        this.props.user
      )
    );
  }

  render() {
    const gks = Object.keys(this.state.matches);
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="all_t_heading">Upcoming Matches</div>
                <div className="t_big_heading">Play. Win. Collect.</div>
                <div className="banner_actions">
                  <Link
                    to={'/match/new'}
                    className="btn btn-default bttn_submit max-width-200 dib mr-2"
                  >
                    Create a match
                  </Link>
                  {this.props.user ? (
                    <Link
                      to={'/u/' + this.props.user.username + '/teams/new'}
                      className="btn btn-default bttn_submit max-width-200 dib"
                    >
                      Create a team
                    </Link>
                  ) : (
                    <Link
                      to={'/login'}
                      className="btn btn-default bttn_submit max-width-200 dib"
                    >
                      Create a team
                    </Link>
                  )}
                </div>
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
                    {this.state.is_loaded && this.state.total_upcoming < 1 ? (
                      <div className="alert alert-warning">
                        There are no active matches. Please check back later or
                        start a new match
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

                    {gks.map((game_id, id) => {
                      return (
                        <div className="content_box" key={game_id}>
                          <h5 className="prizes_desclaimer">
                            {this.state.matches[game_id][0].game.title}
                          </h5>

                          <div id="upcoming-match" className="match-list">
                            <div className="live-wager-row table-header  d-md-flex ">
                              <div className="game-logo-container">Game</div>
                              <div className="wager-cost">Entry per player</div>
                              <div className="wager-team-size d-none d-md-flex">
                                Team Size
                              </div>
                              <div className="wager-region d-none d-md-flex">
                                Platform
                              </div>
                              <div className="start-time d-none d-md-flex">
                                Starting
                              </div>
                              <div className="wager-actions d-none d-md-flex" />
                            </div>
                            {this.state.matches[game_id].map((match, i) => {
                              return (
                                <SingleMatch
                                  id={match.id}
                                  match={match}
                                  user={this.props.user}
                                  initCancel={this.initCancel.bind(this)}
                                  key={match.id}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
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
export default connect(mapStateToProps)(MatchFinder);
