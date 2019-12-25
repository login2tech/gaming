import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
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
  }

  componentDidMount() {
    setTimeout(() => {
      scrollToTop();
    }, 500);
    this.fetchTeams();
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
      '/api/matches/matches_of_user?only_pending=yes&page=' +
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
              // this.fetchTournaments();
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
        this.fetchTeams();
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
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3 className="no-case-change">My Upcoming Matches</h3>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </section>

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
                          <th>Match</th>
                          <th>Result</th>
                          <th>Date</th>
                          <th>Info</th>
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
