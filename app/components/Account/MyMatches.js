import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
import HeaderBox from '../modules/HeaderBox';
class MyMatches extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: props.user,
      user_teams: [],
      is_loaded: false,
      match_played: [],
      money8_played: [],
      tournaments: [],
      matchfinder_page: 1,
      money8_page: 1,
      tour_page: 1,
      pagination_matchfinder: {},
      pagination_money8: {},
      pagination_tour: {}
    };
    // this.table = React.createRef(); // initi
  }

  componentDidMount() {
    setTimeout(() => {
      scrollToTop();
    }, 500);
    this.fetchTeams(true);
  }

  fetchTeams(forward) {
    fetch('/api/teams/team_of_user?uid=' + this.state.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              user_teams: json.teams
            },
            () => {
              if (forward) {
                this.fetchMatches(true);
              }
            }
          );
        }
      });
  }

  fetchMatches(forward) {
    let team_array = [];
    for (let i = 0; i < this.state.user_teams.length; i++) {
      const team_parent = this.state.user_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : {};
      if (team.id && team.team_type == 'matchfinder') {
        team_array.push(team.id);
      }
    }
    team_array = team_array.join(',');

    fetch(
      '/api/matches/matches_of_user?only_pending=yes&page=' +
        this.state.matchfinder_page +
        '&skipchallenge=yes&uid=' +
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
              if (forward) {
                this.fetchMoney8(true);
              }
            }
          );
        }
      });
  }

  fetchTournaments() {
    let team_array = [];
    for (let i = 0; i < this.state.user_teams.length; i++) {
      const team_parent = this.state.user_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : {};
      if (team.id && team.team_type == 'tournaments') {
        team_array.push(team.id);
      }
    }
    team_array = team_array.join(',');

    fetch(
      '/api/tournaments/matches_of_user?only_pending=yes&page=' +
        this.state.matchfinder_page +
        '&uid=' +
        this.state.user_info.id +
        '&teams=' +
        team_array
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

  fetchMoney8(forward) {
    fetch(
      '/api/money8/matches_of_user?only_pending=yes&page=' +
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
              if (forward) {
                this.fetchTournaments();
              }
            }
          );
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
        this.fetchTournaments();
      }
    });
  };

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

  render() {
    return (
      <div>
        <HeaderBox title="Upcoming Matches" />

        <section className="contet_part mb-3">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="mb-3 mt-3 pb-3">
                  <h5 className="prizes_desclaimer">Matchfinder Matches</h5>
                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th className="h-o-p d-none">Match</th>
                          <th>Team</th>
                          <th>Opponent</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th style={{width: '10%'}}>Info</th>
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
                                ) : (
                                  match.status
                                )}
                              </td>
                              {/* <td>{''}</td> */}
                              <td>{moment(match.starts_at).fromNow()}</td>
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

                <div className="mb-3 mt-3 pt-3">
                  <h5 className="prizes_desclaimer">MIX & MATCH Matches</h5>

                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th className="h-o-p d-none">Match</th>
                          <th>Status</th>
                          <th>Expires In</th>
                          <th style={{width: '10%'}}>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.money8_played.map((match, i) => {
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
                              <td>{moment(match.expires_in).format('lll')}</td>
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

                <div className="mb-3 mt-3 pt-3">
                  <h5 className="prizes_desclaimer">Tournament Matches</h5>

                  <div className="table_wrapper">
                    <table
                      className="table table-striped table-ongray table-hover"
                      // ref={element => (this.table = element)}
                    >
                      <thead>
                        <tr>
                          <th>Tournament</th>
                          <th>Round</th>
                          <th className="d-none d-md-table-cell">Status</th>
                          <th className="d-none d-md-table-cell">Date</th>
                          <th style={{width: '10%'}}>Info</th>
                          <th style={{width: '10%'}} className="d-md-none" />
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.tournaments.map((match, i) => {
                          let team_1 = [];
                          let team_2 = [];
                          if (match.status != 'pending') {
                            team_1 = match.team_1_players
                              .split('|')
                              .map(function(a) {
                                return parseInt(a);
                              });

                            team_2 = match.team_2_players
                              .split('|')
                              .map(function(a) {
                                return parseInt(a);
                              });
                          }
                          if (
                            team_1.indexOf(this.props.user.id) < 0 &&
                            team_2.indexOf(this.props.user.id) < 0
                          ) {
                            return false;
                          }
                          return (
                            <React.Fragment key={match.id}>
                              <tr>
                                <td>
                                  <Link to={'/t/' + match.tournament_id}>
                                    {match.tournament.title}
                                  </Link>
                                </td>

                                <td>{match.match_round}</td>
                                <td className="d-none d-md-table-cell">
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
                                <td className="d-none d-md-table-cell">
                                  {moment(match.starts_at).format('lll')}
                                </td>
                                <td>
                                  <Link to={'/tournament-match/' + match.id}>
                                    View <span className="h-o-p">Match</span>
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
                                  <td colSpan="5">
                                    <table className="table">
                                      <tbody>
                                        <tr>
                                          <td>Status</td>
                                          <td>
                                            {match.result ? (
                                              match.result == 'team_1' ? (
                                                team_1.indexOf(
                                                  this.state.user_info.id
                                                ) > -1 ? (
                                                  <span className="text-success">
                                                    W
                                                  </span>
                                                ) : (
                                                  <span className="text-danger">
                                                    L
                                                  </span>
                                                )
                                              ) : match.result == 'team_2' ? (
                                                team_2.indexOf(
                                                  this.state.user_info.id
                                                ) > -1 ? (
                                                  <span className="text-success">
                                                    W
                                                  </span>
                                                ) : (
                                                  <span className="text-danger">
                                                    L
                                                  </span>
                                                )
                                              ) : (
                                                match.result
                                              )
                                            ) : (
                                              match.status
                                            )}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td>Date</td>
                                          <td>
                                            {moment(match.starts_at).format(
                                              'lll'
                                            )}
                                          </td>
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
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(MyMatches);
