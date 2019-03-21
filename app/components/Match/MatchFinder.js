import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
// import Messages from '../Modules/Messages';

class NewTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      matches: [],
      ladder: '',
      games: []
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  componentDidMount() {
    fetch('/api/mathes/upcoming')
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
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="all_t_heading">Upcoming Matches</div>
                <div className="t_big_heading">Play. Win. Collect.</div>

                <Link
                  to={'/matchfinder/new/ '}
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
                    {this.state.matches.length ? (
                      false
                    ) : (
                      <div className="alert alert-warning">
                        There are no active matches. Please check back later or
                        start a new match
                      </div>
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
                            style={{
                              backgroundImage:
                                "url('images/thumbnail_tournament.jpg')"
                            }}
                          >
                            <div className="tournament-body">
                              <Link
                                to={this.matchLink('/m/' + match.id)}
                                className="tournament-name"
                              >
                                Manila masters Toronto 4v4
                              </Link>

                              <span className="date">
                                Oct.09.2018 - 02:35 PM
                              </span>

                              <figure>
                                <img src="images/test.png" alt="Fortnite" />
                              </figure>
                            </div>

                            <div className="tournament-footer">
                              <div className="col">
                                <div className="col-item">
                                  <h5>2 Groups</h5>
                                  <p>62 Teams</p>
                                </div>
                                <div className="col-item">
                                  <h5>PLAYOUT</h5>
                                  <p>ROUND ROBIN</p>
                                </div>
                                <div className="col-item">
                                  <h5>Prize pool</h5>
                                  <p>$ 450 USD</p>
                                </div>
                              </div>

                              <div className="col align-right">
                                <Link
                                  to={this.matchLink('/m/' + match.id)}
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
export default connect(mapStateToProps)(NewTeam);
