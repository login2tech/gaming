import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createTeam} from '../../actions/team';
import game_user_ids from '../../../config/game_user_ids';

class NewTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      ladder: '',
      games: [],
      team_type: ''
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  componentDidMount() {
    fetch('/api/games/list')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              games: json.items
            },
            () => {
              // this.fetchTeams();
            }
          );
        }
      });
  }

  showGamerTag() {
    const {games} = this.state;
    for (let i = 0; i < games.length; i++) {
      const tmp_game = games[i];
      for (let j = 0; j < tmp_game.ladders.length; j++) {
        if (tmp_game.ladders[j].id == this.state.ladder) {
          return (
            <>
              <span
                className={
                  game_user_ids.tag_icons[tmp_game.ladders[j].gamer_tag]
                }
              />
              {game_user_ids.tag_names[tmp_game.ladders[j].gamer_tag]}
              <br />
              <br />
            </>
          );
          // break;
        }
      }
    }
    return '-';
  }

  handleCreation(event) {
    event.preventDefault();
    // ();
    this.props.dispatch(
      createTeam(
        {title: this.state.title, ladder: this.state.ladder},
        this.props.user
      )
    );
  }
  render() {
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="authorize_box">
                <div className="title_default_dark title_border text-center">
                  <h4>New Team</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form onSubmit={this.handleCreation.bind(this)}>
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Team Name</label>
                      <input
                        type="text"
                        id="title"
                        className="form-control"
                        required="required"
                        placeholder="Enter Team Name"
                        name="title"
                        value={this.state.title}
                        onChange={this.handleChange.bind(this)}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Team Ladder</label>

                      <select
                        className="form-control"
                        required="required"
                        name="ladder"
                        id="ladder"
                        value={this.state.ladder}
                        onChange={this.handleChange.bind(this)}
                      >
                        <option value="">Select Ladder</option>
                        {this.state.games.map((game, i) => {
                          return (
                            <optgroup label={game.title} key={game.id}>
                              {game.ladders.map((ladder, j) => {
                                return (
                                  <option value={ladder.id} key={ladder.id}>
                                    {game.title + ' @ ' + ladder.title}
                                  </option>
                                );
                              })}
                            </optgroup>
                          );
                        })}
                        }
                      </select>
                    </div>
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Team Type</label>

                      <select
                        className="form-control"
                        required="required"
                        name="team_type"
                        id="team_type"
                        value={this.state.team_type}
                        onChange={this.handleChange.bind(this)}
                      >
                        <option value="">Select Team Type</option>
                        <option value="matchfinder">Matchfinder</option>
                        <option value="tournaments">Tournaments</option>
                      </select>
                    </div>
                    <div className="form-group col-md-12">
                      <label htmlFor="title">User Id Required</label>
                      <div>
                        {!this.state.ladder ? ' - ' : this.showGamerTag()}
                      </div>
                    </div>
                    <div className="form-group col-md-12 text-center">
                      <button
                        className="btn btn-default bttn_submit"
                        type="submit"
                      >
                        Create Team
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
// export default SingleThread;
export default connect(mapStateToProps)(NewTeam);
