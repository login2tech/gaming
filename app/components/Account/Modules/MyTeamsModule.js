import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
// import MyTeamsModule from './Modules/MyTeamsModule';
class MyTeamsModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user_teams: []};
  }

  componentDidMount() {
    this.fetchTeams();
  }

  fetchTeams() {
    fetch('/api/teams/team_of_user?uid=' + this.props.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              user_teams: json.teams
            },
            () => {
              // this.fetchMatches();
            }
          );
        }
      });
  }

  generateTooltip(team) {
    let str = '';
    if (team.team_type === 'tournaments') {
      str += "<span class='fa fa-trophy'></span> ";
    }
    str +=
      team.team_type +
      ' team' +
      '<br />' +
      team.ladder.game_info.title +
      ' - ' +
      team.ladder.title;
    return '<span class="text-capitalize">' + str + '</span>';
  }

  render() {
    return (
      <ul className="team_list">
        {this.state.user_teams.map((team_parent, i) => {
          const team = team_parent.team_info ? team_parent.team_info : {};
          if (team.removed) {
            return false;
          }

          let wins = 0;
          let loss = 0;
          // console.log(team.score);
          let score = team.score;
          if (!score) {
            score = [];
          }
          for (let i = 0; i < score.length; i++) {
            wins += score[i].wins;
            loss += score[i].loss;
          }
          return (
            <li className="item" key={team.id}>
              <a
                href={
                  '/u/' + this.props.user_info.username + '/teams/' + team.id
                }
                title={this.generateTooltip(team)}
                data-toggle="tooltip"
                // onClick={event => {
                //   $(event.target).tooltip('hide');
                // }}
                style={{display: 'inline-block'}}
              >
                <figure className="avatr">
                  {team.profile_picture ? (
                    <img src={team.profile_picture} />
                  ) : (
                    <img src="/images/team_bg.png" />
                  )}
                </figure>
                <div className="info">
                  {team.title}
                  <br />
                  <div className="info_sub">
                    {team.score ? (
                      <div>
                        <span className="text-success">{wins} W</span> -{' '}
                        <span className="text-danger">{loss} L</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-success">0 W</span> -{' '}
                        <span className="text-danger">0 L</span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            </li>
          );
        })}
        {this.props.user && this.props.user_info.id == this.props.user.id ? (
          <li className="item ">
            <a href={'/u/' + this.props.user_info.username + '/teams/new'}>
              <figure className="avatr">
                <img src="/images/team_new.png" />
              </figure>
              <div
                className="info "
                style={
                  {
                    // visibility: 'hidden'
                  }
                }
              >
                <br />
                Create a new Team
              </div>
            </a>
          </li>
        ) : (
          false
        )}
      </ul>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(MyTeamsModule);
