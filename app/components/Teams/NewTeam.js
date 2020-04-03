import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createTeam} from '../../actions/team';
import game_user_ids from '../../../config/game_user_ids';

class NewTeam extends React.Component {
  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
      title: '',
      ladder:
        props && props.params && props.params.type && props.params.type == 'l'
          ? props.params.id
          : '',
      tournaments: [],
      games: [],
      submit_started: false,
      ladder_disabled:
        props && props.params && props.params.type && props.params.type == 'l'
          ? true
          : false,
      team_type:
        props && props.params && props.params.type
          ? props.params.type == 't'
            ? 'tournaments'
            : 'matchfinder'
          : 'matchfinder',
      tournament:
        props && props.params && props.params.type
          ? props.params.type == 't'
            ? props.params.id
            : null
          : null,
      game_seleted:
        props && props.params && props.params.type
          ? props.params.type == 'g'
            ? parseInt(props.params.id)
            : false
          : false
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  fetchTour() {
    if (
      this.props &&
      this.props.params &&
      this.props.params.type &&
      this.props.params.type == 't'
    ) {
      fetch('/api/tournaments/single/' + this.props.params.id)
        .then(res => res.json())
        .then(json => {
          if (json.ok) {
            this.setState({
              ladder: json.item.ladder_id,
              ladder_disabled: true
            });
          }
        });
    }
  }

  handleChangeTeamName(event) {
    let val = event.target.value ? event.target.value : '';
    // val = val.trim();
    // val = val.toLowerCase();
    // alert();
    val = val.replace(/[^a-zA-Z0-9.-\s]/g, '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    if (
      val[0] == '-' ||
      val[0] == ' ' ||
      val[0] == '_' ||
      val[0] == '1' ||
      val[0] == '2' ||
      val[0] == '3' ||
      val[0] == '4' ||
      val[0] == '5' ||
      val[0] == '6' ||
      val[0] == '7' ||
      val[0] == '8' ||
      val[0] == '9' ||
      val[0] == '0'
    ) {
      val = val.replace(val[0], '');
    }

    this.setState({[event.target.name]: val});
  }

  fetchTours() {
    fetch('/api/tournaments/upcoming')
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
              this.fetchTours();
              this.fetchTour();
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
          const tg = game_user_ids.tag_names[tmp_game.ladders[j].gamer_tag];
          return (
            <>
              <span
                className={
                  game_user_ids.tag_icons[tmp_game.ladders[j].gamer_tag]
                }
              />
              {tg == 'Activision ID' ? 'ID' : tg}

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
    if (this.state.submit_started) {
      return;
    }
    this.setState({
      submit_started: true
    });
    setTimeout(() => {
      this.setState({
        submit_started: false
      });
    }, 2000);
    this.props.dispatch(
      createTeam(
        {
          title: this.state.title,
          ladder: this.state.ladder,
          team_type: this.state.team_type,
          team_t_id: this.state.tournament
        },
        this.props.user
      )
    );
  }
  render() {
    const {ladder_disabled} = this.state;
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
                        maxlen="20"
                        maxLength="20"
                        max="20"
                        required="required"
                        placeholder="Enter Team Name"
                        name="title"
                        value={this.state.title}
                        onChange={this.handleChangeTeamName.bind(this)}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <label htmlFor="title">Team Ladder</label>

                      <select
                        className="form-control"
                        required="required"
                        name="ladder"
                        disabled={ladder_disabled}
                        id="ladder"
                        value={this.state.ladder}
                        onChange={this.handleChange.bind(this)}
                      >
                        <option value="">Select Ladder</option>
                        {this.state.games.map((game, i) => {
                          if (
                            this.state.game_seleted &&
                            this.state.game_seleted != game.id
                          ) {
                            return false;
                          }
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
                    {this.state.ladder_disabled ? (
                      <div>
                        <div className="form-group col-md-12">
                          <label htmlFor="title">Team Type</label>

                          <select
                            className="form-control"
                            required="required"
                            disabled={ladder_disabled}
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
                        {this.state.team_type == 'tournaments' ? (
                          <div className="form-group col-md-12">
                            <label htmlFor="title">Tournament</label>

                            <select
                              className="form-control"
                              required="required"
                              name="tournament"
                              disabled={ladder_disabled}
                              id="tournament"
                              value={this.state.tournament}
                              onChange={this.handleChange.bind(this)}
                            >
                              <option value="">Select Team Type</option>
                              {this.state.tournaments.map((t, i) => {
                                return (
                                  <option value={t.id} key={i.id}>
                                    {t.title}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        ) : (
                          false
                        )}
                      </div>
                    ) : (
                      false
                    )}
                    <div className="form-group col-md-12">
                      <label htmlFor="title">User Id Required</label>
                      <div class="uid_det">
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
