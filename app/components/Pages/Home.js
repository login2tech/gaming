import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import {Translate} from 'react-localize-redux';
import {Link} from 'react-router';
import SingleTournament from '../Tournament/SingleTournament';
import SingleTournamentSmall from '../Tournament/SingleTournamentSmall';
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
      tournaments: [],
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
    this.runQuery4();
  }
  runQuery4() {
    fetch('/api/tournaments/upcoming?limit=5')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            tournaments: json.items
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
                <div className="carousel-caption sm_btn_on_mob_wrap ">
                  <a
                    href="/shop"
                    className="sm_btn_on_mob play_match_btn stretched-link"
                  >
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
                <div className="section-headline white-headline text-center less_mrgns">
                  <h3>Find Your Game</h3>
                  <p>Choose Your Game To Get Started</p>
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

        <section className="tournaments toursec">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Upcoming Tournaments</h3>
                </div>
              </div>
            </div>

            <div className="row">
              {this.state.tournaments.map((tour, i) => {
                if (i == 0) {
                  return <SingleTournament key={tour.id} tour={tour} />;
                }
                return false;
              })}
              <div className="col-md-6">
                <div className="row">
                  {this.state.tournaments.map((tour, i) => {
                    if (i == 0) {
                      return false;
                    }
                    return <SingleTournamentSmall key={tour.id} tour={tour} />;
                  })}
                </div>
              </div>
              {this.state.t_loaded && this.state.tournaments.length == 0 ? (
                <div className="alert alert-warning">
                  There is no upcoming tournament. Check again later.
                </div>
              ) : (
                false
              )}
            </div>
          </div>
        </section>

        <section className="tournaments toursec">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-center">
                  <h3>Recent Matches</h3>
                </div>
              </div>
            </div>

            <div className="row" style={{overflow: 'hidden'}}>
              {this.state.recentMatches.map((match, i) => {
                let cls = 'col-md-5 br_1 pl-4';
                if (i == 0) {
                  cls = 'col-md-5 br_1 offset-md-1';
                }
                return (
                  <div className={cls} key={match.id}>
                    <div className="row has_m">
                      <div className="col-12 col-md team_spn_m ht1info">
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
                      <div className="col-6 col-md-5 team_spn_m no-just mldr">
                        <span>
                          <span className="text-l">
                            {match.ladder.game_info.title}
                          </span>
                          <span className="text-m">{match.ladder.title}</span>
                        </span>
                      </div>
                      <div className="col-6 col-md-5 team_spn_m no-just d-md-none mldrpr">
                        <span>
                          <span className="text-l  text-success">
                            ${match.match_fee ? match.match_fee : '0'}
                          </span>
                          <span className="text-m">PRIZE</span>
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-md team_spn_m ht2info">
                        {match.team_2_info ? (
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
                      <div className="col-12 col-md-5 team_spn_m no-just d-none d-md-flex">
                        <span>
                          <span className="text-l  text-success">
                            ${match.match_fee ? match.match_fee : '0'}
                          </span>
                          <span className="text-m">PRIZE</span>
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

        <div className="main_slider_home">
          <div
            id="demo3"
            className="carousel slide"
            data-ride="carousel"
            data-pause="false"
          >
            <div className="carousel-inner">
              <div
                className="carousel-item"
                style={{background: '#fff', display: 'block'}}
              >
                <img src="images/banner_2.png" alt="" />
                <div className="carousel-caption sm_btn_on_mob_wrap ">
                  <a
                    href="/shop"
                    className="sm_btn_on_mob play_match_btn stretched-link"
                  >
                    View Plans
                  </a>
                </div>
                <a href="/shop" className="stretched-link" />
              </div>
            </div>
          </div>
        </div>

        <section className="featruedboxes">
          <div className="container">
            <div className="row">
              <div className="col ">
                <div className="section-headline white-headline text-center">
                  <div>
                    <h5>WHAT ARE YOU WAITING FOR?</h5>
                  </div>
                  <Link to={'/signup'} className="play_match_btn mt-4">
                    Get Started Now
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
