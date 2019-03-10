import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import {Translate} from 'react-localize-redux';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: []
    };
  }
  componentDidMount() {
    this.runQuery(this.props);
  }

  runQuery(prps) {
    fetch('/api/games/listPaged').then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState({games: obj.items});
        });
      }
    });
  }

  language = {};
  render() {
    // console.log(this.props);
    return (
      <div>
        <div className="main_slider_home">
          <div id="demo" className="carousel slide" data-ride="carousel">
            <ul className="carousel-indicators">
              <li data-target="#demo" data-slide-to="0" className="active" />
              <li data-target="#demo" data-slide-to="1" />
            </ul>
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src="images/game-1.jpg" alt="" />
                <div className="carousel-caption">
                  <h3>Play Video Games </h3>
                  <p>Win Cash</p>
                  <a className="play_match_btn" href="#">
                    Play Match
                  </a>
                </div>
              </div>
              <div className="carousel-item">
                <img src="images/game-2.jpg" alt="" />
                <div className="carousel-caption">
                  <h3>Play Video Games </h3>
                  <p>Win Cash</p>
                  <a className="play_match_btn" href="#">
                    Play Match
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className="featruedboxes">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Upcoming tournaments</h3>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <ul id="upcoming-tournament" className="tournament-list active">
                  <li
                    className="tournament-box"
                    style={{
                      backgroundImage: "url('images/thumbnail_tournament.jpg')"
                    }}
                  >
                    <div className="tournament-body">
                      <a href="#" className="tournament-name">
                        Manila masters Toronto 4v4
                      </a>

                      <span className="date">Oct.09.2018 - 02:35 PM</span>

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
                        <a href="#" className="btn-default">
                          More details
                        </a>
                      </div>
                    </div>
                  </li>
                  <li
                    className="tournament-box"
                    style={{
                      backgroundImage: "url('images/base-copy-2.jpg')"
                    }}
                  >
                    <div className="tournament-body">
                      <a href="#" className="tournament-name">
                        EU WINNERS League - Starter Division{' '}
                      </a>

                      <span className="date">Oct.25.2018 - 01:06 PM</span>

                      <figure>
                        <img src="images/csgo_logo.png" alt="" />
                      </figure>
                    </div>

                    <div className="tournament-footer">
                      <div className="col">
                        <div className="col-item">
                          <h5>2 Groups</h5>
                          <p>32 Teams</p>
                        </div>
                        <div className="col-item">
                          <h5>PLAYOUT</h5>
                          <p>ROUND ROBIN</p>
                        </div>
                        <div className="col-item">
                          <h5>Prize pool</h5>
                          <p>$ 300 USD</p>
                        </div>
                      </div>

                      <div className="col align-right">
                        <a href="#" className="btn-default">
                          More details
                        </a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <a className="play_match_btn" href="#">
                  View All
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="games">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Find Your Game</h3>
                  <p>Play Your Favourite Games</p>
                </div>
              </div>
            </div>

            <div className="row">
              {this.state.games.map((games, i) => {
                if (i > 3) {
                  return false;
                }
                return (
                  <div
                    className="col-lg-3 col-md-3 col-sm-3 col-xs-12"
                    key={games.id}
                  >
                    <div className="game_c_box">
                      <div className="game_pic">
                        <img src={games.image_url} />
                      </div>

                      <a
                        href={
                          '/games/' +
                          games.id +
                          '/' +
                          games.title.toLowerCase().replace(/ /g, '-')
                        }
                        className="game_platform"
                      >
                        Play
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="row">
              {this.state.games.map((games, i) => {
                if (i < 4 || i > 7) {
                  return false;
                }
                return (
                  <div
                    className="col-lg-3 col-md-3 col-sm-3 col-xs-12"
                    key={games.id}
                  >
                    <div className="game_c_box">
                      <div className="game_pic">
                        <img src={games.image_url} />
                      </div>

                      <a
                        href={
                          '/games/' +
                          games.id +
                          '/' +
                          games.title.toLowerCase().replace(/ /g, '-')
                        }
                        className="game_platform"
                      >
                        Play
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="tournaments">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Tournaments</h3>
                  <p>Watch latest tournaments</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <ul id="upcoming-tournament" className="tournament-list active">
                  <li
                    className="tournament-box"
                    style={{
                      backgroundImage: "url('images/thumbnail_tournament.jpg')"
                    }}
                  >
                    <div className="tournament-body">
                      <a href="#" className="tournament-name">
                        Manila masters Toronto 4v4
                      </a>

                      <span className="date">Oct.09.2018 - 02:35 PM</span>

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
                        <a href="#" className="btn-default">
                          More details
                        </a>
                      </div>
                    </div>
                  </li>
                  <li
                    className="tournament-box"
                    style={{
                      backgroundImage: "url('images/base-copy-2.jpg')"
                    }}
                  >
                    <div className="tournament-body">
                      <a href="#" className="tournament-name">
                        EU WINNERS League - Starter Division{' '}
                      </a>

                      <span className="date">Oct.25.2018 - 01:06 PM</span>

                      <figure>
                        <img src="images/csgo_logo.png" alt="" />
                      </figure>
                    </div>

                    <div className="tournament-footer">
                      <div className="col">
                        <div className="col-item">
                          <h5>2 Groups</h5>
                          <p>32 Teams</p>
                        </div>
                        <div className="col-item">
                          <h5>PLAYOUT</h5>
                          <p>ROUND ROBIN</p>
                        </div>
                        <div className="col-item">
                          <h5>Prize pool</h5>
                          <p>$ 300 USD</p>
                        </div>
                      </div>

                      <div className="col align-right">
                        <a href="#" className="btn-default">
                          More details
                        </a>
                      </div>
                    </div>
                  </li>
                  <li
                    className="tournament-box"
                    style={{
                      backgroundImage: "url('images/tournament_sasas.jpg')"
                    }}
                  >
                    <div className="tournament-body">
                      <a href="#" className="tournament-name">
                        ENDPOINTGG VS CEX ESPORTS [2]{' '}
                      </a>

                      <span className="date">Oct.10.2018 - 02:35 PM</span>

                      <figure>
                        <img src="images/ww2logo.png" alt="Call of Duty WW2" />
                      </figure>
                    </div>

                    <div className="tournament-footer">
                      <div className="col">
                        <div className="col-item">
                          <h5>2 Groups</h5>
                          <p>22 Teams</p>
                        </div>
                        <div className="col-item">
                          <h5>PLAYOUT</h5>
                          <p>ROUND ROBIN</p>
                        </div>
                        <div className="col-item">
                          <h5>Prize pool</h5>
                          <p>$ 1000 USD</p>
                        </div>
                      </div>

                      <div className="col align-right">
                        <a href="#" className="btn-default">
                          More details
                        </a>
                      </div>
                    </div>
                  </li>
                  <li
                    className="tournament-box"
                    style={{
                      backgroundImage: "url('images/tournament_card.jpg')"
                    }}
                  >
                    <div className="tournament-body">
                      <a href="#" className="tournament-name">
                        TORNEO SPANISH PRO LEAGUE{' '}
                      </a>

                      <span className="date">Oct.09.2018 - 02:35 PM</span>

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
                          <p>$ 4500 USD</p>
                        </div>
                      </div>

                      <div className="col align-right">
                        <a href="#" className="btn-default">
                          More details
                        </a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="teams">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Monthly Leaderboards</h3>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="wind_heading">
                  <i className="fa fa-gamepad" aria-hidden="true" /> MATCH WINS
                </div>

                <div className="win_player_info">
                  <div className="player_pic">
                    <img src="images/img.jpg" />
                  </div>
                  <div className="player_name">
                    1. <a href="#">Cambert</a>
                  </div>
                  <div className="wind_count">
                    36 <span>Wins</span>
                  </div>
                </div>

                <div className="outer_win_list">
                  <ul>
                    <li>
                      <span className="usernames">
                        <strong>2. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>
                    <li>
                      <span className="usernames">
                        <strong>3. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>

                    <li>
                      <span className="usernames">
                        <strong>4. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>

                    <li>
                      <span className="usernames">
                        <strong>5. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="wind_heading">
                  <i className="fa fa-trophy" aria-hidden="true" /> TOURNAMENT
                  WINS
                </div>

                <div className="win_player_info">
                  <div className="player_pic">
                    <img src="images/play_game_1.jpg" />
                  </div>
                  <div className="player_name">
                    1. <a href="#">Cambert</a>
                  </div>
                  <div className="wind_count">
                    48 <span>Wins</span>
                  </div>
                </div>

                <div className="outer_win_list">
                  <ul>
                    <li>
                      <span className="usernames">
                        <strong>2. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>
                    <li>
                      <span className="usernames">
                        <strong>3. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>

                    <li>
                      <span className="usernames">
                        <strong>4. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>

                    <li>
                      <span className="usernames">
                        <strong>5. </strong>
                        <a href="#">Da_lemonademan</a>
                      </span>{' '}
                      <span className="win_stats">
                        <strong>415</strong> Wins
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="call_action">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Go Prime, Get More Out of OnlyCompGaming Gaming.</h3>
                  <a className="play_match_btn" href="#">
                    View Plans
                  </a>
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
    messages: state.messages,
    language: state.language
  };
};

export default connect(mapStateToProps)(Home);
