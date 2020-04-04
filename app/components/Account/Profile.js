import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {openModal, closeModal} from '../../actions/modals';
import game_user_ids from '../../../config/game_user_ids';
import PaymentModal from '../Modules/Modals/PaymentModal';
import ProfileHeader from './ProfileHeader';
import ProfileHeaderMobile from './ProfileHeaderMobile';
import MyTeamsModule from './Modules/MyTeamsModule';
import utils from '../../utils';

import SendMessage from '../Modules/Modals/SendMessage';
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
      trophy_counts: {
        gold: 0,
        silver: 0,
        bronze: 0,
        blue: 0
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
    // this.tour_tbl_ref = React.createRef();
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

  onGetToken(token, type) {
    fetch('/api/user/reset/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stripe_token:
          token == 'USE_OCG' || token == 'USE_PAYPAL' ? token : token.id,
        action: type
      })
    }).then(response => {
      this.props.dispatch(
        closeModal({
          id: 'payment'
        })
      );
      if (response.ok) {
        // this.props.refresh();
        this.props.dispatch({type: 'CLR_MSG'});
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

  resetPop(heading, type) {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'payment',
        zIndex: 534,
        heading: heading,
        content: (
          <PaymentModal
            msg={'You need to pay a small amount to ' + heading}
            amount={5}
            // refresh={props.refresh}
            onGetToken={token => {
              this.onGetToken(token, type);
            }}
          />
        )
      })
    );
  }

  resetOverallTrSilver(e) {
    e.preventDefault();
    this.resetPop('Reset Silver Trophies', 'SILVER_TROPHIES');
  }

  resetOverallTrBronze(e) {
    e.preventDefault();
    this.resetPop('Reset Bronze Trophies', 'BRONZE_TROPHIES');
  }

  resetOverall(e) {
    e.preventDefault();
    this.resetPop('Reset Score', 'overallScore');
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
    // console.log('forward: ', forward);
    let yesno = 'yes';
    if (forward) {
      yesno = 'yes';
    } else {
      yesno = 'no';
    }
    fetch(
      '/api/user_info?addViews=' + yesno + '&uid=' + this.props.params.username
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          if (forward) {
            json.user_info.profile_views++;
          }
          this.setState(
            {
              is_loaded: true,
              user_info: json.user_info,
              username: this.props.params.username
            },
            () => {
              if (forward) {
                this.fetchTrophies();
              }
            }
          );
        }
      });
  }

  fetchTrophies() {
    fetch('/api/user_info/trophies/count?uid=' + this.state.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              trophy_counts: json.counts
            },
            () => {
              this.fetchTeams();
            }
          );
        } else {
          this.fetchTeams();
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

  startChat(e) {
    e.preventDefault();
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'chat_',
        zIndex: 534,
        heading: 'Send Direct Message',

        content: <SendMessage data={this.state.user_info.id} />
      })
    );
  }

  render() {
    return (
      <div>
        <ProfileHeader
          user_info={this.state.user_info}
          is_loaded={this.state.is_loaded}
          fetchUserInfo={this.fetchUserInfo.bind(this)}
          current_tab="profile"
          onChat={e => {
            this.startChat(e);
          }}
        />
        <ProfileHeaderMobile
          user_info={this.state.user_info}
          is_loaded={this.state.is_loaded}
          fetchUserInfo={this.fetchUserInfo.bind(this)}
          current_tab="profile"
          onChat={e => {
            this.startChat(e);
          }}
        />
        <section
          className="contet_part single_match_details"
          style={{paddingTop: 0}}
        >
          <div className="container">
            {this.state.is_loaded ? (
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="content_box">
                    <div className="prof_stat row">
                      <div className="col-6 col-md-3 usr_obj">
                        <div className="rank-data">
                          <div>RANK</div>{' '}
                          <div>{this.state.user_info.xp_rank}</div>{' '}
                          <div>{this.state.user_info.life_xp} XP</div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3 usr_obj">
                        <div className="winnings-data">
                          <div>EARNINGS</div>{' '}
                          <div>
                            $
                            {this.state.user_info.life_earning
                              ? this.state.user_info.life_earning
                              : '0'}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3 usr_obj">
                        <div className="career-data">
                          <div>PROFILE RECORD</div>{' '}
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
                          <div>
                            {this.state.user_info.wins +
                              this.state.user_info.loss ==
                            0
                              ? 100
                              : parseFloat(
                                  (this.state.user_info.wins * 100) /
                                    (this.state.user_info.wins +
                                      this.state.user_info.loss)
                                ).toFixed(2)}
                            % WIN RATE
                          </div>
                          {this.props.user &&
                          this.props.user.id == this.state.user_info.id &&
                          (this.state.user_info.wins ||
                            this.state.user_info.loss) ? (
                            <a
                              style={{float: 'right'}}
                              className="reset_rep"
                              href="#"
                              onClick={this.resetOverall.bind(this)}
                            >
                              <span className="fa fa-repeat" /> reset ($5)
                            </a>
                          ) : (
                            false
                          )}
                        </div>
                      </div>
                      <div className="col-6 col-md-3 usr_obj">
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
                      <div className="user-profile-trophies-container row">
                        <div className="single-trophy-container single-trofy col-6 col-md-6 col-lg-4">
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
                              <div className="trophy-count">
                                {this.state.trophy_counts.gold}
                              </div>
                              {this.props.user &&
                              this.props.user.id == this.state.user_info.id &&
                              this.state.trophy_counts.silver > 0 ? (
                                <a
                                  style={{float: 'right'}}
                                  className="reset_rep d-md-none"
                                >
                                  &nbsp;
                                </a>
                              ) : (
                                false
                              )}
                            </div>
                          </Link>
                        </div>
                        <div className="single-trophy-container single-trofy col-6 col-md-6 col-lg-4">
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
                                {this.props.user &&
                                this.props.user.id == this.state.user_info.id &&
                                this.state.trophy_counts.silver > 0 ? (
                                  <a
                                    style={{float: 'right'}}
                                    className="reset_rep d-none d-md-inline-block"
                                    href="#"
                                    onClick={this.resetOverallTrSilver.bind(
                                      this
                                    )}
                                  >
                                    <span className="fa fa-repeat" /> reset ($5)
                                  </a>
                                ) : (
                                  false
                                )}
                              </div>
                              <div className="trophy-count">
                                {this.state.trophy_counts.silver}
                              </div>
                              {this.props.user &&
                              this.props.user.id == this.state.user_info.id &&
                              this.state.trophy_counts.silver > 0 ? (
                                <a
                                  style={{float: 'right'}}
                                  className="reset_rep d-md-none"
                                  href="#"
                                  onClick={this.resetOverallTrSilver.bind(this)}
                                >
                                  <span className="fa fa-repeat" /> reset ($5)
                                </a>
                              ) : (
                                false
                              )}
                            </div>
                          </Link>
                        </div>
                        <div className="single-trophy-container single-trofy col-6 col-md-6 col-lg-4">
                          <Link
                            to={
                              '/u/' +
                              this.state.user_info.username +
                              '/trophies/bronze'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/assets/icons/bronze.png" />
                            </div>
                            <div className="trophy-info">
                              <div
                                className="trophy-name bronze"
                                style={{color: '#a26631'}}
                              >
                                Bronze Trophies
                                {this.props.user &&
                                this.props.user.id == this.state.user_info.id &&
                                this.state.trophy_counts.bronze > 0 ? (
                                  <a
                                    style={{float: 'right'}}
                                    className="reset_rep d-none d-md-inline-block"
                                    href="#"
                                    onClick={this.resetOverallTrBronze.bind(
                                      this
                                    )}
                                  >
                                    <span className="fa fa-repeat" /> reset ($5)
                                  </a>
                                ) : (
                                  false
                                )}
                              </div>
                              <div className="trophy-count">
                                {this.state.trophy_counts.bronze}
                              </div>
                              {this.props.user &&
                              this.props.user.id == this.state.user_info.id &&
                              this.state.trophy_counts.bronze > 0 ? (
                                <a
                                  style={{float: 'right'}}
                                  className="reset_rep d-md-none"
                                  href="#"
                                  onClick={this.resetOverallTrBronze.bind(this)}
                                >
                                  <span className="fa fa-repeat" /> reset ($5)
                                </a>
                              ) : (
                                false
                              )}
                            </div>
                          </Link>
                        </div>

                        <div className="single-trophy-container single-trofy col-6 col-md-6 col-lg-4 order-md-5">
                          <Link
                            to={
                              '/u/' +
                              this.state.user_info.username +
                              '/trophies/ocg'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/assets/icons/ocg.png" />
                            </div>
                            <div className="trophy-info">
                              <div
                                className="trophy-name bronze"
                                style={{color: 'rgb(43, 127, 197)'}}
                              >
                                OCG Trophies
                              </div>
                              <div className="trophy-count">
                                {this.state.trophy_counts.blue}
                              </div>
                              {this.props.user &&
                              this.props.user.id == this.state.user_info.id &&
                              this.state.trophy_counts.bronze > 0 ? (
                                <a
                                  style={{float: 'right'}}
                                  className="reset_rep d-md-none"
                                >
                                  &nbsp;
                                </a>
                              ) : (
                                false
                              )}
                            </div>
                          </Link>
                        </div>

                        <div className="single-trophy-container col-6 col-md-6 col-lg-4 order-md-4">
                          <Link
                            to={
                              '/records/' +
                              this.state.user_info.username +
                              '/season'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/images/trophy_seasonal.png" />
                            </div>
                            <div className="trophy-info">
                              <div className="trophy-name blue">
                                Seasonal Records
                              </div>
                              <div className="trophy-count"> </div>
                            </div>
                          </Link>
                        </div>

                        <div className="single-trophy-container col-6 col-md-6 col-lg-4 order-md-6">
                          <Link
                            to={
                              '/records/' +
                              this.state.user_info.username +
                              '/life'
                            }
                            className="trof_a"
                          >
                            <div className="trophy-image">
                              <img src="/images/trophy_career.png" />
                            </div>
                            <div className="trophy-info">
                              <div className="trophy-name blue">
                                Career Records
                              </div>
                              <div className="trophy-count"> </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-user" aria-hidden="true" /> ABOUT
                    </h5>

                    <div className="list_pad prof_abt">
                      <div className="row gamer_tags_profile pt-0">
                        <div className="col-md-4 col-12 mb-0 pljy">
                          <span> MEMBER SINCE</span>
                          <p>
                            {moment(this.state.user_info.created_at).format(
                              'lll'
                            )}
                          </p>
                        </div>
                        <div className="col-md-4 col-12 mb-0 pljy">
                          <span> TIME ZONE </span>
                          <p>
                            {this.state.user_info.timezone
                              ? this.state.user_info.timezone
                              : '-'}
                          </p>
                        </div>
                        <div className="col-md-4 col-12 mb-0 pljy  ">
                          <span> REGION </span>
                          <p>
                            {this.state.user_info.country
                              ? this.state.user_info.country ==
                                  'United States' ||
                                this.state.user_info.country == 'Canada'
                                ? 'North America'
                                : this.state.user_info.country
                              : '-'}
                            {utils.getCountryImage(
                              this.state.user_info.country
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="row gamer_tags_profile pt-3">
                        <h4 className="d-md-none mb-4">GAME ID</h4>
                        {game_user_ids.tags.map((k, i) => {
                          if (
                            !this.state.user_info['gamer_tag_' + k] ||
                            this.state.user_info['gamer_tag_' + k] == ''
                          ) {
                            return false;
                          }
                          return (
                            <div className="col-md-4" key={k}>
                              <span className="dib ico_bxx">
                                <span className={game_user_ids.tag_icons[k]} />
                              </span>
                              <div class="dib vtt">
                              <span>{game_user_ids.tag_names[k]}</span>
                              <p>{this.state.user_info['gamer_tag_' + k]}</p>
                              </div>
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
                    {this.state.user_info && this.state.user_info.id ? (
                      <MyTeamsModule
                        id={this.state.user_info.id}
                        user_info={this.state.user_info}
                      />
                    ) : (
                      false
                    )}
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">RECENT MATCHES</h5>

                    <div className="table_wrapper">
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th className="h-o-p  d-none">Match</th>
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
                            if (match.status == 'cancelled') {
                              return false;
                            }
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
                                <td className="h-o-p  d-none">
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
                                  ) : match.status == 'accepted' ? (
                                    'pending'
                                  ) : (
                                    match.accepted
                                  )}
                                </td>
                                {/* <td>{''}</td> */}
                                <td>
                                  {moment(match.created_at).format('lll')}
                                </td>
                                <td>
                                  {' '}
                                  <Link to={'/m/' + match.id}>
                                    View <span className="h-o-p">Match</span>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
                    <h5 className="prizes_desclaimer">RECENT MIX & MATCHES</h5>

                    <div className="table_wrapper">
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th className="h-o-p  d-none">Match</th>
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
                            if (match.status == 'cancelled') {
                              return false;
                            }
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
                                <td className="h-o-p  d-none">
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
                                <td>
                                  {moment(match.created_at).format('lll')}
                                </td>
                                <td>
                                  <Link to={'/mix-and-match/' + match.id}>
                                    View <span className="h-o-p">Match</span>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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

                    <div className="table_wrapper">
                      <table
                        // ref={element => (this.tour_tbl_ref = element)}
                        key={'tour_data' + this.state.user_info.id}
                        className="table table-striped table-ongray table-hover"
                      >
                        <thead>
                          <tr>
                            <th>Tournament</th>
                            <th>Game & Ladder</th>
                            <th className="d-none d-md-table-cell">Date</th>
                            <th className="d-none d-md-table-cell">Status</th>
                            <th>Info</th>
                            <th style={{width: '10%'}} className="d-md-none" />
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.tournaments.map((match, i) => {
                            if (match.status == 'cancelled') {
                              return false;
                            }
                            return (
                              <React.Fragment key={match.id}>
                                <tr>
                                  <td>
                                    <span className="h-o-p">
                                      <Link to={'/t/' + match.id}>
                                        #{match.id}
                                      </Link>{' '}
                                      -{' '}
                                    </span>
                                    {match.title}
                                  </td>
                                  <td>
                                    {match.game.title} - {match.ladder.title}
                                  </td>
                                  <td className="d-none d-md-table-cell">
                                    {moment(match.starts_at).format('lll')}
                                  </td>
                                  <td
                                    className={
                                      ' d-none d-md-table-cell status_' +
                                      match.status
                                    }
                                  >
                                    {match.status}
                                  </td>
                                  <td>
                                    <Link to={'/t/' + match.id}>
                                      View{' '}
                                      <span className="h-o-p">Tournament</span>
                                    </Link>
                                  </td>
                                  <td className="d-md-none">
                                    <button
                                      className="btn btn-link"
                                      onClick={() => {
                                        this.setState({
                                          expanded:
                                            match.id == this.state.expand_id
                                              ? !this.state.expanded
                                              : true,
                                          expand_id: match.id
                                        });
                                      }}
                                    >
                                      <span
                                        className={
                                          this.state.expanded &&
                                          this.state.expand_id == match.id
                                            ? ' fa fa-minus'
                                            : ' fa fa-plus '
                                        }
                                      />
                                    </button>
                                  </td>
                                </tr>
                                {this.state.expanded &&
                                this.state.expand_id == match.id ? (
                                  <tr key={'e_' + match.id}>
                                    <td colSpan="4">
                                      <table className="table">
                                        <tbody>
                                          <tr>
                                            <td>Date</td>
                                            <td>
                                              {moment(match.starts_at).format(
                                                'lll'
                                              )}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td>Status</td>
                                            <td>{match.status}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                ) : (
                                  false
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
