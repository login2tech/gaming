import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import {createMatch8} from '../../actions/match8';
import game_user_ids from '../../../config/game_user_ids';

import {Link} from 'react-router';

class NewMoney8 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      ladder: false,
      games: [],
      players_total: '',
      players: [props.user],
      expires_in: '',
      match_type: '',
      match_fee: 0
    };
  }

  showGamerTag(ladder) {
    if (!ladder) {
      return 'Platform User id';
    }
    return (
      <>
        <span className={game_user_ids.tag_icons[ladder.gamer_tag]} />
        {game_user_ids.tag_names[ladder.gamer_tag]}
      </>
    );
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

  handleCreation(event) {
    let p = this.state.ladder;
    // const ladder = false;
    let game_id;
    let ladder_id;
    if (p) {
      p = p.split('_');
      game_id = parseInt(p[0]);
      ladder_id = parseInt(p[1]);
    }

    event.preventDefault();
    this.props.dispatch(
      createMatch8(
        {
          match_type: this.state.match_type,
          players_total: this.state.players_total,
          // match_players: this.state.player,
          game_id: game_id,
          ladder_id: ladder_id,
          expires_in: this.state.expires_in,
          match_fee: this.state.match_type == 'free' ? '' : this.state.match_fee
        },
        this.props.user
      )
    );
  }

  amIEligible(team_u, ladder) {
    const gamer_tag = ladder.gamer_tag;
    if (!team_u['gamer_tag_' + gamer_tag]) {
      return false;
    }
    if (this.state.match_type == '') {
      return 'waiting';
    }

    const amount = parseFloat(this.state.match_fee);

    if (this.state.match_type == 'free') {
      return true;
    }

    if (this.state.match_type != 'free' && !this.state.match_fee) {
      return 'waiting';
    }

    if (this.state.match_type == 'cash') {
      if (parseFloat(team_u.cash_balance) < amount) {
        return false;
      }
    }

    if (this.state.match_type == 'credits') {
      if (parseFloat(team_u.credit_balance) < amount) {
        return false;
      }
    }

    return true;
  }
  render() {
    let p = this.state.ladder;
    let ladder = false;

    if (p) {
      p = p.split('_');

      const game_id = parseInt(p[0]);
      const ladder_id = parseInt(p[1]);

      for (let i = 0; i < this.state.games.length; i++) {
        if (this.state.games[i].id == game_id) {
          if (!this.state.games[i].ladders) {
            continue;
          }
          for (let j = 0; j < this.state.games[i].ladders.length; j++) {
            // game = this.state.games;
            if (this.state.games[i].ladders[j].id == ladder_id) {
              ladder = this.state.games[i].ladders[j];
            }
          }
        }
      }
    }
    // console.log(ladder);
    return (
      <section className="middle_part_login">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="authorize_box" style={{maxWidth: '100%'}}>
                <div className="title_default_dark title_border text-center">
                  <h4>New mix-and-match Match</h4>
                </div>
                <div className="field_form authorize_form">
                  <Messages messages={this.props.messages} />
                  <br />
                  <form onSubmit={this.handleCreation.bind(this)}>
                    <div className="form-group col-md-12">
                      <label htmlFor="ladder">Match Ladder</label>

                      <select
                        className="form-control"
                        required
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
                                  <option
                                    value={'' + game.id + '_' + ladder.id}
                                    key={ladder.id}
                                  >
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

                    {/*
                      <div className="form-group col-md-12">
                        <label htmlFor="title">Ladder</label>
                        <br />
                        <strong>
                        {this.state.game_info.title +
                        ' - ' +
                        this.state.team_info.ladder.title}
                        </strong>
                      </div>
                      */}

                    <div className="form-group col-md-12">
                      <label htmlFor="title">User Id Required</label>
                      <br />
                      <strong>{this.showGamerTag(ladder)}</strong>
                    </div>
                    <div className="form-group col-md-12">
                      <label htmlFor="match_type">Match Type</label>
                      <select
                        required
                        onChange={this.handleChange.bind(this)}
                        className="form-control"
                        name="match_type"
                        id="match_type"
                      >
                        <option value="">Select</option>
                        <option value="free">Free</option>
                        <option value="credits">Paid using Credits</option>
                        <option value="cash">Paid using OCG Cash</option>
                      </select>
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor="players_total">
                        Total Players In mix-and-match Pool
                      </label>
                      <select
                        required
                        onChange={this.handleChange.bind(this)}
                        className="form-control"
                        name="players_total"
                        id="players_total"
                      >
                        <option value="">Select</option>
                        <option value="4">4</option>
                        <option value="6">6</option>
                        <option value="8">8</option>
                        <option value="12">12</option>
                        <option value="16">16</option>
                      </select>
                    </div>

                    <div className="form-group col-md-12">
                      <label htmlFor="expires_in">Match Expires in</label>
                      <select
                        required
                        onChange={this.handleChange.bind(this)}
                        className="form-control"
                        name="expires_in"
                        id="expires_in"
                      >
                        <option value="">Select</option>
                        <option value="5|minutes">5 minutes</option>
                        <option value="10|minutes">10 minutes</option>
                        <option value="15|minutes">15 minutes</option>
                        <option value="20|minutes">20 minutes</option>
                        <option value="30|minutes">30 minutes</option>
                        <option value="45|minutes">45 minutes</option>
                        <option value="60|minutes">1 hour</option>
                        <option value="120|minutes">2 hours</option>
                        <option value="5|hours">5 hours</option>
                      </select>
                    </div>

                    {this.state.match_type == 'credits' ||
                    this.state.match_type == 'cash' ? (
                      <div className="form-group col-md-12">
                        <label htmlFor="match_fee">Match Entry Fee</label>
                        <input
                          type="text"
                          id="match_fee"
                          className="form-control"
                          onChange={this.handleChange.bind(this)}
                          required
                          placeholder="Match Fees"
                          name="match_fee"
                        />
                      </div>
                    ) : (
                      false
                    )}

                    <div className="form-group col-md-12 text-center">
                      <button
                        disabled={
                          !this.amIEligible(this.state.players[0], ladder)
                        }
                        className="btn btn-default bttn_submit"
                        type="submit"
                      >
                        Create Match
                      </button>
                    </div>
                  </form>
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <div className="content_box">
                        <h5 className="prizes_desclaimer">
                          <i className="fa fa-users" aria-hidden="true" />{' '}
                          Players
                        </h5>

                        <table className="table table-striped table-ongray table-hover">
                          <thead>
                            <tr>
                              <th>Username</th>
                              <th>{this.showGamerTag(ladder)}</th>
                              <th>Eligibility</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.players.map((team_user, i) => {
                              return (
                                <tr key={team_user.id}>
                                  <td>
                                    <Link
                                      to={
                                        team_user
                                          ? '/u/' + team_user.username
                                          : ''
                                      }
                                    >
                                      {team_user.username}
                                    </Link>
                                  </td>
                                  <td>
                                    {team_user[
                                      'gamer_tag_' + ladder.gamer_tag
                                    ] ? (
                                      team_user['gamer_tag_' + ladder.gamer_tag]
                                    ) : (
                                      <span className="text-danger">
                                        No user id
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {this.amIEligible(team_user, ladder) ==
                                    'waiting' ? (
                                      ' -- '
                                    ) : this.amIEligible(team_user, ladder) ? (
                                      <span className="text-success">
                                        <img
                                          className="icon_size"
                                          src="/images/controller-green.svg"
                                        />{' '}
                                        Eligible
                                      </span>
                                    ) : (
                                      <span className="text-danger">
                                        <img
                                          className="icon_size"
                                          src="/images/controller-red.svg"
                                        />{' '}
                                        Not Eligible
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
export default connect(mapStateToProps)(NewMoney8);
