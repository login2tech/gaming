import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import {Translate} from 'react-localize-redux';
import {Link} from 'react-router';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
      recentMatches: []
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
      this.runQuery2();
    });
  }
  runQuery2() {
    fetch('/api/matches/recent?limit=2').then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState({recentMatches: obj.items});
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
          <div
            id="demo"
            className="carousel slide"
            data-ride="carousel"
            data-pause="false"
          >
            <ul className="carousel-indicators">
              <li data-target="#demo" data-slide-to="0" className="active" />
              <li data-target="#demo" data-slide-to="1" className="" />
              <li data-target="#demo" data-slide-to="2" className="" />
            </ul>
            <div className="carousel-inner">
              <div
                className="carousel-item active"
                style={{background: '#fff'}}
              >
                <img src="images/banner_1.png" alt="" />
              </div>
              <div className="carousel-item" style={{background: '#fff'}}>
                <img src="images/banner_3.png" alt="" />
              </div>
              <div className="carousel-item" style={{background: '#fff'}}>
                <img src="images/banner_2.png" alt="" />
                <div className="carousel-caption d-none d-md-block ">
                  <a href="/shop" className="play_match_btn stretched-link">
                    View Plans
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section
          className="games bg-black"
          style={{marginBottom: 0, paddingTop: 20, paddingBottom: 50}}
        >
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 ">
                <div className="section-headline white-headline text-center">
                  <h3>Find Your Game</h3>
                  <p>Play Your Favorite Games</p>
                </div>
              </div>
            </div>

            <div className="row no-gutters">
              {this.state.games.map((games, i) => {
                if (i > 6) {
                  return false;
                }
                return (
                  <div
                    className="col-6 col-md game_hover_effect "
                    key={games.id}
                  >
                    <div className="game_c_box">
                      <div className="game_pic">
                        <a
                          href={
                            '/game/' +
                            games.id +
                            '/' +
                            games.title.toLowerCase().replace(/ /g, '-')
                          }
                        >
                          <img src={games.image_url} />
                        </a>
                      </div>

                      <a
                        href={
                          '/game/' +
                          games.id +
                          '/' +
                          games.title.toLowerCase().replace(/ /g, '-')
                        }
                        className="game_platform "
                      >
                        Play {games.title}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="row">
              {/*this.state.games.map((games, i) => {
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
                                  '/game/' +
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
                      })*/}
            </div>
          </div>
        </section>

        <div className="main_slider_home">
          <div id="demo" className="carousel slide" data-ride="carousel">
            <div className="carousel-inner">
              <div
                className="carousel-item active"
                style={{background: '#fff'}}
              >
                <img
                  src="images/slide_1.png"
                  className="d-none d-md-inline"
                  alt=""
                />
                <img
                  src="images/slide_1_mobile.png"
                  className="d-inline d-md-none"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        <div className="main_slider_home  bg-black">
          <div id="demo2" className="carousel slide" data-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  src="images/slide_2.png"
                  alt=""
                  className="d-none d-md-inline"
                />
                <img
                  src="images/slide_2_mobile.png"
                  alt=""
                  className="d-inline d-md-none pt-3"
                />
              </div>
            </div>
          </div>
        </div>
        {/*<section className="featruedboxes">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-sm-6 col-xs-6">
                <div className="section-headline white-headline text-center">
                  <h3>
                    Upcoming <br />
                    matches
                  </h3>
                  <br />

                  <br />
                  <br />
                  <Link to={'/matchfinder'} className="play_match_btn">
                    View All
                  </Link>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-xs-6">
                <div className="section-headline white-headline text-center">
                  <h3>
                    Upcoming <br />
                    tournaments
                  </h3>
                  <br />

                  <br />
                  <br />
                  <Link to={'/tournaments'} className="play_match_btn">
                    View All
                  </Link>
                </div>
              </div>
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
        </section>*/}
        <section className="tournaments">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Recent Matches</h3>
                </div>
              </div>
            </div>

            <div className="row">
              {this.state.recentMatches.map((match, i) => {
                return (
                  <div className="col-md-6 br_1" key={match.id}>
                    <div className="row has_m">
                      <div className="col team_spn_m">
                        {match.team_1_info ? (
                          <>
                            <Link
                              className="mw100"
                              to={'/teams/view/' + match.team_1_id}
                            >
                              <img
                                className="img-fluid team_avat "
                                src={
                                  match.team_1_info.profile_picture
                                    ? match.team_1_info.profile_picture
                                    : '/images/team_bg.png'
                                }
                              />
                            </Link>{' '}
                            <span>
                              <span className="text-l">
                                <Link
                                  className="mw100"
                                  to={'/teams/view/' + match.team_1_id}
                                >
                                  {match.team_1_info.title}
                                </Link>
                              </span>
                              {match.result == 'team_1' ? (
                                <span className="wtm text-success">WINNER</span>
                              ) : (
                                false
                              )}
                            </span>
                          </>
                        ) : (
                          false
                        )}
                      </div>
                      <div className="col team_spn_m">
                        <span>
                          <span className="text-l">
                            {match.ladder.game_info.title}
                          </span>
                          <span className="text-m">{match.ladder.title}</span>
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col team_spn_m">
                        {match.team_1_info ? (
                          <>
                            <Link
                              className="mw100"
                              to={'/teams/view/' + match.team_2_id}
                            >
                              <img
                                className="img-fluid team_avat "
                                src={
                                  match.team_2_info.profile_picture
                                    ? match.team_2_info.profile_picture
                                    : '/images/team_bg.png'
                                }
                              />
                            </Link>{' '}
                            <span>
                              <span className="text-l">
                                <Link
                                  className="mw100"
                                  to={'/teams/view/' + match.team_2_id}
                                >
                                  {match.team_2_info.title}
                                </Link>
                              </span>
                              {match.result == 'team_2' ? (
                                <span className="wtm text-success">WINNER</span>
                              ) : (
                                false
                              )}
                            </span>
                          </>
                        ) : (
                          false
                        )}
                      </div>
                      <div className="col team_spn_m">
                        <span>
                          <span className="text-l">
                            {' '}
                            ${match.match_fee ? match.match_fee : '0'}
                          </span>
                          <span className="text-m">price</span>
                        </span>
                      </div>
                    </div>
                    <br />
                    <div className="row">
                      <div className="col text-center">
                        <Link to={'/m/' + match.id}>
                          match info <span className="fa fa-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="call_action no_bg">
          <Link className="play_match_btn stretched-link" to="/shop">
            View Plans
          </Link>
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
