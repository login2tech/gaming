import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
import HeaderBox from '../Modules/HeaderBox';
class MyChallenges extends React.Component {
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
    fetch(
      '/api/teams/team_of_user?only_leader=true&uid=' + this.state.user_info.id
    )
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
    const me = this.props.user.id;
    for (let i = 0; i < this.state.user_teams.length; i++) {
      const team_parent = this.state.user_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : {};
      if (
        team.id &&
        team.team_type == 'matchfinder' &&
        team.team_creator == me
      ) {
        team_array.push(team.id);
      }
    }
    team_array = team_array.join(',');

    fetch(
      '/api/matches/matches_of_user?onlychallenge=yes&only_pending=yes&page=' +
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
            match_played: json.items,
            pagination_matchfinder: json.pagination ? json.pagination : {}
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
      }
    });
  };

  getTeams(match) {
    const team_1_id = match.team_1_id;
    const team_2_id = match.team_2_id;
    const {user_teams} = this.state;
    return [match.challenge_team_info, match.team_1_info, 2];
  }

  render() {
    return (
      <div>
        <HeaderBox title="My Challenges" />
        <section className="contet_part mb-3">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="mb-3 mt-3 pb-3">
                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th className="h-o-p d-none">Match</th>
                          <th>Team</th>
                          <th>Opponent</th>
                          <th>Status</th>
                          <th>Expiring</th>
                          <th style={{width: '20%'}}>Info</th>
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
                                  View <span className="h-o-p">Challenge</span>
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

export default connect(mapStateToProps)(MyChallenges);
