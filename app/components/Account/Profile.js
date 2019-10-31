import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {openModal, closeModal} from '../../actions/modals';

import PaymentModal from '../Modules/Modals/PaymentModal';
import ProfileHeader from './ProfileHeader';

import ReactPaginate from 'react-paginate';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: {
        first_name: ' ',
        last_name: ' ',
        followers: [],
        teams: [],
        xp_obj: [],
        score: []
      },
      user_teams: [],
      is_loaded: false,
      renderTab: 'profile',
      match_played: [],
      money8_played: [],
      tournaments: [],
      matchfinder_page: 1,
      money8_page: 1,
      tour_page: 1,
      pagination_matchfinder: {},
      pagination_money8: {},
      pagination_tour: {},
      new_post_type: 'text',
      new_post_image: '',
      new_post_video: '',
      posts_page: 1
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.params.username != prevState.username) {
      return {username: nextProps.params.username};
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.username != this.state.username) {
      this.fetchUserInfo(true);
    }
    //
  }

  onGetToken(token) {
    fetch('/api/user/reset/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token_id: token.id,
        action: 'overallScore'
      })
    }).then(response => {
      this.props.dispatch(
        closeModal({
          id: 'payment'
        })
      );
      if (response.ok) {
        // this.props.refresh();
        this.props.dispatch({type: 'CLEAR_MESSAGES'});
        this.props.dispatch(
          openModal({
            id: 'trello_snack',
            type: 'snackbar',
            zIndex: 1076,
            content: 'Reseting Score... please wait...'
          })
        );
        setTimeout(() => {
          this.props.dispatch(
            closeModal({
              id: 'trello_snack'
            })
          );
          window.location.reload();
        }, 5000);
      } else {
        this.props.dispatch({
          type: 'GENERIC_FAILURE',
          messages: Array.isArray(response) ? response : [response]
        });
      }
    });
  }

  resetOverall(e) {
    e.preventDefault();
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'payment',
        zIndex: 534,
        heading: 'Reset Score',
        content: (
          <PaymentModal
            msg={
              'You need to pay a small amount to reset overall score. This will have no impact on your life and season score.'
            }
            amount={5}
            // refresh={props.refresh}
            onGetToken={token => {
              this.onGetToken(token);
            }}
          />
        )
      })
    );
  }

  getTeams(match) {
    const team_1_id = match.team_1_id;
    const team_2_id = match.team_2_id;
    const {user_teams} = this.state;

    for (let i = 0; i < user_teams.length; i++) {
      if (team_1_id == user_teams[i].team_info.id) {
        return [match.team_1_info, match.team_2_info, 1];
      }
      if (team_2_id == user_teams[i].team_info.id) {
        return [match.team_2_info, match.team_1_info, 2];
      }
    }
    return [match.team_1_info, match.team_2_info, 1];
  }

  componentDidMount() {
    setTimeout(() => {
      const element = document.getElementById('is_top');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 500);
    this.fetchUserInfo(true);
  }

  fetchUserInfo(forward) {
    fetch('/api/user_info?addViews=yes&uid=' + this.props.params.username)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              user_info: json.user_info,
              username: this.props.params.username
            },
            () => {
              if (forward) {
                this.fetchTeams();
              }
            }
          );
        }
      });
  }

  fetchTeams() {
    fetch('/api/teams/team_of_user?uid=' + this.state.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              user_teams: json.teams
            },
            () => {
              this.fetchMatches();
            }
          );
        }
      });
  }

  fetchMatches() {
    let team_array = [];
    for (let i = 0; i < this.state.user_teams.length; i++) {
      const team_parent = this.state.user_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : {};
      team_array.push(team.id);
    }
    team_array = team_array.join(',');

    fetch(
      '/api/matches/matches_of_user?exclude_pending=yes&page=' +
        this.state.matchfinder_page +
        '&uid=' +
        this.state.user_info.id +
        '&teams=' +
        team_array
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              match_played: json.items,
              pagination_matchfinder: json.pagination ? json.pagination : {}
            },
            () => {
              this.fetchMoney8();
            }
          );
        }
      });
  }

  fetchMoney8() {
    fetch(
      '/api/money8/matches_of_user?page=' +
        this.state.money8_page +
        '&uid=' +
        this.state.user_info.id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              money8_played: json.items,
              pagination_money8: json.pagination ? json.pagination : {}
            },
            () => {
              this.fetchTournaments();
            }
          );
        }
      });
  }

  fetchTournaments() {
    fetch(
      '/api/tournaments/t_of_user?exclude_pending=yes&page=' +
        this.state.tour_page +
        '&uid=' +
        this.state.user_info.id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            tournaments: json.items,
            pagination_tour: json.pagination ? json.pagination : {}
          });
        }
      });
  }

  handlePageClick = (data, typ) => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({[typ + '_page']: selected}, () => {
      if (typ == 'matchfinder') {
        this.fetchMatches();
      } else if (typ == 'money8') {
        this.fetchMoney8();
      } else if (typ == 'tour') {
        this.fetchTeams();
      }
    });
  };

  tags = [1, 2, 3, 4, 5];
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    // 'Username',
    'Epic Games Username',
    'Steam Username',
    'Battletag'
  ];

  render() {
    return (
      <div>
        <ProfileHeader
          user_info={this.state.user_info}
          is_loaded={this.state.is_loaded}
          fetchUserInfo={this.fetchUserInfo.bind(this)}
          current_tab="profile"
        />
        <section className="contet_part single_match_details">
          <div className="container">
            {this.state.is_loaded ? (
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-trophy" aria-hidden="true" />{' '}
                      ACHIEVEMENT
                    </h5>
                    <br />

                    <div className="user-profile-stats">
                      <div className="user-profile-header-data">
                        <div className="rank-data">
                          <div>RANK</div>{' '}
                          <div>{this.state.user_info.xp_rank}</div>{' '}
                          <div>{this.state.user_info.life_xp} XP</div>
                        </div>
                      </div>
                      <div className="user-profile-header-data">
                        <div className="winnings-data">
                          <div>WINNINGS</div>{' '}
                          <div>
                            $
                            {this.state.user_info.lifetime_earning
                              ? this.state.user_info.lifetime_earning
                              : '0'}
                          </div>
                        </div>
                      </div>
                      <div className="user-profile-header-data">
                        <div className="career-data">
                          <div>CAREER RECORD</div>{' '}
                          <div>
                            <span className="text-success">
                              {this.state.user_info.wins
                                ? this.state.user_info.wins
                                : '0'}{' '}
                              W
                            </span>{' '}
                            -{' '}
                            <span className="text-danger">
                              {this.state.user_info.loss
                                ? this.state.user_info.loss
                                : '0'}{' '}
                              L
                            </span>
                          </div>
                          {this.props.user &&
                          this.props.user.id == this.state.user_info.id &&
                          (this.state.user_info.wins ||
                            this.state.user_info.loss) ? (
                            <a
                              style={{float: 'right'}}
                              href="#"
                              onClick={this.resetOverall.bind(this)}
                            >
                              <span className="fa fa-repeat" /> reset ($5)
                            </a>
                          ) : (
                            false
                          )}
                          <div>
                            {this.state.user_info.wins +
                              this.state.user_info.loss ==
                            0
                              ? 100
                              : (this.state.user_info.wins * 100) /
                                (this.state.user_info.wins +
                                  this.state.user_info.loss)}
                            % WIN RATE
                          </div>
                        </div>
                      </div>
                      <div className="user-profile-header-data">
                        <div className="views-data">
                          <div>PROFILE VIEWS</div>{' '}
                          <div>
                            {this.state.user_info.profile_views
                              ? this.state.user_info.profile_views
                              : '0'}
                          </div>{' '}
                          <div />
                        </div>
                      </div>
                    </div>

                    <div className="user-profile-trophies-wrapper">
                      <div className="user-profile-trophies-container">
                        <div className="single-trophy-container">
                          <Link
                            to={
                              '/u/' +
                              this.state.user_info.username +
                              '/trophies/gold'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/assets/icons/gold.png" />
                            </div>
                            <div className="trophy-info">
                              <div className="trophy-name gold">
                                Gold Trophies
                              </div>
                              <div className="trophy-count">0</div>
                            </div>
                          </Link>
                        </div>
                        <div className="single-trophy-container">
                          <Link
                            to={
                              '/u/' +
                              this.state.user_info.username +
                              '/trophies/silver'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/assets/icons/silver.png" />
                            </div>
                            <div className="trophy-info">
                              <div
                                className="trophy-name silver"
                                style={{color: '#dadcdd'}}
                              >
                                Silver Trophies
                              </div>
                              <div className="trophy-count">0</div>
                            </div>
                          </Link>
                        </div>
                        <div className="single-trophy-container">
                          <Link
                            to={
                              '/u/' +
                              this.state.user_info.username +
                              '/trophies/bronze'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/assets/icons/bronz.png" />
                            </div>
                            <div className="trophy-info">
                              <div
                                className="trophy-name bronze"
                                style={{color: '#a26631'}}
                              >
                                Bronze Trophies
                              </div>
                              <div className="trophy-count">0</div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="user-profile-trophies-wrapper">
                      <div className="user-profile-trophies-container">
                        <div className="single-trophy-container">
                          <div className="trophy-image">
                            <img src="/images/shield-gold.png" />
                          </div>
                          <div className="trophy-info">
                            <Link
                              to={
                                '/records/' +
                                this.state.user_info.username +
                                '/season'
                              }
                              className="trophy-name gold"
                            >
                              Seasonal Records
                            </Link>
                          </div>
                        </div>

                        <div className="single-trophy-container">
                          <Link
                            to={
                              '/u/' +
                              this.state.user_info.username +
                              '/trophies/ocg'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/assets/icons/blue.png" />
                            </div>
                            <div className="trophy-info">
                              <div
                                className="trophy-name bronze"
                                style={{color: 'rgb(43, 127, 197)'}}
                              >
                                OCG Trophies
                              </div>
                              <div className="trophy-count">0</div>
                            </div>
                          </Link>
                        </div>

                        <div className="single-trophy-container">
                          <div className="trophy-image">
                            <img src="/images/shield-gold.png" />
                          </div>
                          <div className="trophy-info">
                            <Link
                              to={
                                '/records/' +
                                this.state.user_info.username +
                                '/life'
                              }
                              className="trophy-name gold"
                            >
                              Career Records
                            </Link>
                          </div>
                        </div>

                        {/*this.state.user_info.score.map((xp, i) => {
                        return (
                          <div className="single-trophy-container" key={xp.id}>
                            <div className="trophy-image">
                              <img src="/images/shield-gold.png" />
                            </div>
                            <div className="trophy-info">
                              <div className="trophy-name gold">
                                {xp.ladder.title}
                              </div>
                              <div className="trophy-count">
                                <span className="text-success">{xp.wins}W</span>{' '}
                                -{' '}
                                <span className="text-danger">{xp.loss}L</span>
                              </div>
                            </div>
                          </div>
                        );
                      })*/}
                      </div>
                    </div>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-user" aria-hidden="true" /> ABOUT
                    </h5>

                    <div className="list_pad">
                      <div className="row">
                        <div className="col-md-4">
                          <span> MEMBER SINCE</span>
                          <p>
                            {moment(this.state.user_info.created_at).format(
                              'lll'
                            )}
                          </p>
                        </div>

                        <div className="col-md-4">
                          <span> TIME ZONE </span>
                          <p>
                            {this.state.user_info.timezone
                              ? this.state.user_info.timezone
                              : '-'}
                          </p>
                        </div>

                        <div className="col-md-4">
                          <span>Rank</span>
                          <p>-</p>
                        </div>
                      </div>

                      <div className="row">
                        {this.tags.map((k, i) => {
                          if (
                            !this.state.user_info['gamer_tag_' + k] ||
                            this.state.user_info['gamer_tag_' + k] == ''
                          ) {
                            return false;
                          }
                          return (
                            <div className="col-md-4" key={k}>
                              <span>{this.tag_names[k]}</span>
                              <p>{this.state.user_info['gamer_tag_' + k]}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-users" aria-hidden="true" /> TEAMS
                    </h5>

                    <ul className="team_list">
                      {this.state.user_teams.map((team_parent, i) => {
                        const team = team_parent.team_info
                          ? team_parent.team_info
                          : {};
                        if (team.removed) {
                          return false;
                        }
                        return (
                          <li className="item" key={team.id}>
                            <Link
                              to={
                                '/u/' +
                                this.state.user_info.username +
                                '/teams/' +
                                team.id
                              }
                            >
                              <img src="/images/team_bg.png" />
                              <div className="info">
                                {team.title}
                                <br />
                                <div className="info_sub">
                                  {team.score ? (
                                    <div>
                                      <span className="text-success">10 W</span>{' '}
                                      -{' '}
                                      <span className="text-danger">10 L</span>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-success">0 W</span>{' '}
                                      - <span className="text-danger">0 L</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                      {this.props.user &&
                      this.state.user_info.id == this.props.user.id ? (
                        <li>
                          <a
                            href={
                              '/u/' +
                              this.state.user_info.username +
                              '/teams/new'
                            }
                          >
                            <img src="/images/team_new.png" />
                          </a>
                        </li>
                      ) : (
                        false
                      )}
                    </ul>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">RECORD BY MATCHES</h5>

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Team</th>
                          <th>Opponent</th>
                          <th>Result</th>
                          <th>Date</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.match_played.map((match, i) => {
                          const teams = this.getTeams(match);
                          let is_win = false;
                          let is_loss = false;
                          // is_status = true;
                          if (match.result) {
                            if (match.result == 'team_1') {
                              if (teams[2] == 1) {
                                is_win = true;
                              } else {
                                is_loss = false;
                              }
                            } else if (match.result == 'team_2') {
                              if (teams[2] == 2) {
                                is_win = true;
                              } else {
                                is_loss = false;
                              }
                            } else {
                              // is_status = true;
                            }
                          }
                          {
                            is_win ? (
                              <span className="text-success">W</span>
                            ) : (
                              false
                            );
                          }
                          {
                            is_loss ? (
                              <span className="text-danger">L</span>
                            ) : (
                              false
                            );
                          }
                          {
                            !is_win && !is_loss ? match.status : false;
                          }

                          return (
                            <tr key={match.id}>
                              <td>
                                <Link to={'/m/' + match.id}>#{match.id}</Link>
                              </td>
                              <td>
                                <Link to={'/teams/view/' + teams[0].id}>
                                  {teams[0].title}
                                </Link>
                              </td>
                              <td>
                                {teams[1] ? (
                                  <Link to={'/teams/view/' + teams[0].id}>
                                    {teams[1].title}
                                  </Link>
                                ) : (
                                  ' '
                                )}
                              </td>
                              <td>
                                {match.result ? (
                                  match.result == 'team_1' ? (
                                    teams[2] == 1 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : match.result == 'team_2' ? (
                                    teams[2] == 2 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : (
                                    match.result
                                  )
                                ) : (
                                  match.status
                                )}
                              </td>
                              {/* <td>{''}</td> */}
                              <td>{moment(match.created_at).format('lll')}</td>
                              <td>
                                {' '}
                                <Link to={'/m/' + match.id}>View Match</Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <ReactPaginate
                      previousLabel={'previous'}
                      nextLabel={'next'}
                      breakLabel={'...'}
                      breakClassName={'break-me'}
                      pageCount={this.state.pagination_matchfinder.pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={data => {
                        this.handlePageClick(data, 'matchfinder');
                      }}
                      containerClassName={'pagination'}
                      subContainerClassName={'pages pagination'}
                      activeClassName={'active'}
                    />
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">MIX & MATCH Matches</h5>

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Result</th>
                          <th>Date</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.money8_played.map((match, i) => {
                          // const teams = this.getTeams(match);
                          // const is_win = false;
                          // const is_loss = false;
                          let team_1 = [];
                          let team_2 = [];
                          if (match.status != 'pending') {
                            team_1 = match.team_1.split('|').map(function(a) {
                              return parseInt(a);
                            });

                            team_2 = match.team_2.split('|').map(function(a) {
                              return parseInt(a);
                            });
                          }
                          return (
                            <tr key={match.id}>
                              <td>
                                <Link to={'/mix-and-match/' + match.id}>
                                  #{match.id}
                                </Link>
                              </td>

                              <td>
                                {match.result ? (
                                  match.result == 'team_1' ? (
                                    team_1.indexOf(this.state.user_info.id) >
                                    -1 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : match.result == 'team_2' ? (
                                    team_2.indexOf(this.state.user_info.id) >
                                    -1 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : (
                                    match.result
                                  )
                                ) : (
                                  match.status
                                )}
                              </td>
                              <td>{moment(match.created_at).format('lll')}</td>
                              <td>
                                <Link to={'/mix-and-match/' + match.id}>
                                  View Match
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <ReactPaginate
                      previousLabel={'previous'}
                      nextLabel={'next'}
                      breakLabel={'...'}
                      breakClassName={'break-me'}
                      pageCount={this.state.pagination_money8.pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={data => {
                        this.handlePageClick(data, 'money8');
                      }}
                      containerClassName={'pagination'}
                      subContainerClassName={'pages pagination'}
                      activeClassName={'active'}
                    />
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">RECENT TOURNAMENTS</h5>

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Tournament</th>
                          <th>Tournament Placing</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.tournaments.map((match, i) => {
                          return (
                            <tr key={match.id}>
                              <td>{match.id}</td>
                              <td>
                                {match.game.title} - {match.ladder.title}
                              </td>
                              <td>{moment(match.starts_at).format('lll')}</td>
                              <td>{match.status}</td>
                              <td>
                                {' '}
                                <Link to={'/t/' + match.id}>
                                  View Tournament
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <ReactPaginate
                      previousLabel={'previous'}
                      nextLabel={'next'}
                      breakLabel={'...'}
                      breakClassName={'break-me'}
                      pageCount={this.state.pagination_tour.pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={data => {
                        this.handlePageClick(data, 'tour');
                      }}
                      containerClassName={'pagination'}
                      subContainerClassName={'pages pagination'}
                      activeClassName={'active'}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <span className="fa fa-spinner fa-spin" />
            )}
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

export default connect(mapStateToProps)(Profile);
