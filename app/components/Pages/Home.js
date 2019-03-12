import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import {Translate} from 'react-localize-redux';
import {Link} from 'react-router';

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
                  <Link className="play_match_btn" to="/matchfinder">
                    Play Match
                  </Link>
                </div>
              </div>
              <div className="carousel-item">
                <img src="images/game-2.jpg" alt="" />
                <div className="carousel-caption">
                  <h3>Play Video Games </h3>
                  <p>Win Cash</p>
                  <Link className="play_match_btn" to="/matchfinder">
                    Play Match
                  </Link>
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
                <ul
                  id="upcoming-tournament"
                  className="tournament-list active"
                />
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
                        Play {games.title}
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
                        Play {games.title}
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
                <ul
                  id="upcoming-tournament"
                  className="tournament-list active"
                />
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

                <div className="win_player_info" />

                <div className="outer_win_list">
                  <ul />
                </div>
              </div>

              <div className="col-md-6">
                <div className="wind_heading">
                  <i className="fa fa-trophy" aria-hidden="true" /> TOURNAMENT
                  WINS
                </div>

                <div className="win_player_info" />

                <div className="outer_win_list">
                  <ul />
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
                  <Link className="play_match_btn" to="/membership">
                    View Plans
                  </Link>
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
