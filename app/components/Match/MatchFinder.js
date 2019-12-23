import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
import game_user_ids from '../../../config/game_user_ids';

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

  render() {
    const gks = Object.keys(this.state.matches);
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="all_t_heading">Upcoming Matches</div>
                <div className="t_big_heading">Play. Win. Collect.</div>
                <Link
                  to={'/match/new'}
                  className="btn btn-default bttn_submit max-width-200 dib"
                >
                  Create a match
                </Link>{' '}
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
                    className="btn btn-default bttn_submit max-width-300"
                  >
                    Create a team
                  </Link>
                )}
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

                          <ul
                            id="upcoming-tournament"
                            className="tournament-list active"
                          >
                            {this.state.matches[game_id].map((match, i) => {
                              let txt = '';
                              // const txt2 = '';
                              txt = 'Accept Match';
                              let t1p = match.team_1_players;
                              if (!t1p) {
                                t1p = '';
                              }
                              let show_cancel = false;
                              t1p = t1p.split('|');
                              // console.log(t1p);
                              if (t1p.indexOf('' + this.props.user.id) > -1) {
                                txt = 'View Match';
                                if (match.status == 'pending') {
                                  show_cancel = true;
                                }
                              }

                              return (
                                <li
                                  key={match.id}
                                  className="tournament-box"
                                  style={{background: '#27204d'}}
                                >
                                  <div className="tournament-body">
                                    <Link
                                      to={this.matchLink('/m/' + match.id)}
                                      className="tournament-name text-white"
                                    >
                                      <span
                                        className={
                                          game_user_ids.tag_icons[
                                            match.ladder.gamer_tag
                                          ] + ' float-none'
                                        }
                                      />
                                      {match.game.title} - {match.ladder.title}
                                    </Link>

                                    <span className="date">
                                      {moment(match.starts_at).format('lll')}
                                    </span>
                                    <span className="date">
                                      Starts {moment(match.starts_at).fromNow()}
                                    </span>
                                  </div>
                                  <div className="tournament-footer">
                                    <div className="row">
                                      <div className="col-6 col-md-3 t-col">
                                        <h5>Status</h5>
                                        <p>{match.status}</p>
                                      </div>
                                      <div className="col-6 col-md-3 t-col">
                                        <h5>TYPE</h5>
                                        <p>
                                          {match.match_type == 'free' ? (
                                            'FREE'
                                          ) : (
                                            <span>
                                              {'PAID (' +
                                                (match.match_type == 'cash'
                                                  ? '' +
                                                    match.match_fee +
                                                    ' OCG Cash'
                                                  : '' +
                                                    match.match_fee +
                                                    ' credits') +
                                                ')'}
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      <div className="col-6 col-md-3 t-col">
                                        <h5>Prize pool</h5>
                                        <p>
                                          {match.match_type == 'paid'
                                            ? '$ ' + match.match_fee
                                            : '--'}
                                        </p>
                                      </div>
                                      <div className="col-6 col-md-3 t-col">
                                        <h5>Players</h5>
                                        <p>
                                          {match.match_players}v
                                          {match.match_players}
                                        </p>
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
                                        to={this.matchLink('/m/' + match.id)}
                                        className="btn-default"
                                      >
                                        {txt}
                                      </Link>
                                      {show_cancel ? (
                                        <Link
                                          to={this.matchLink('/m/' + match.id)}
                                          className="btn-danger btn cnclMt"
                                        >
                                          Cancel Match
                                        </Link>
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
