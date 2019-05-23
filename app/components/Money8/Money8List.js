import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
// const moment = require('moment');

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
              <div className="col-md-8 col-sm-12 col-xs-12">
                <div className="all_t_heading">Upcoming Money8 Matches</div>
                <div className="t_big_heading">Play. Win. Collect.</div>
              </div>
              <div className="col-md-4 col-sm-12 col-xs-12">
                <Link
                  to={'/money8/new/'}
                  className="btn btn-default bttn_submit"
                >
                  Create a match
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
                        There are no active money8 matches. Please check back
                        later or start a new match
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
                                to={this.matchLink('/m/' + match.id)}
                                className="tournament-name"
                              >
                                {match.game.title} - {match.ladder.title}
                              </Link>

                              <span className="date">
                                {match.players_joined}/{match.players_total}{' '}
                                have joined
                              </span>
                            </div>

                            <div className="tournament-footer">
                              <div className="col">
                                <div className="col-item">
                                  <h5>Status</h5>
                                  <p>{match.status}</p>
                                </div>
                                <div className="col-item">
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
                                <div className="col-item">
                                  <h5>Prize pool</h5>
                                  <p>
                                    {match.match_type != 'free'
                                      ? '$ ' +
                                        match.match_fee +
                                        ' ' +
                                        (match.match_type == 'cash'
                                          ? 'cash'
                                          : 'credits')
                                      : '--'}
                                  </p>
                                </div>
                                <div className="col-item">
                                  <h5>Players</h5>
                                  <p>
                                    {match.players_total / 2}v
                                    {match.players_total / 2}
                                  </p>
                                </div>
                              </div>

                              <div className="col align-right">
                                <Link
                                  to={this.matchLink('/money8/' + match.id)}
                                  className="btn-default"
                                >
                                  Join Match
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
