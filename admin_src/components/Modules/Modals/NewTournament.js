import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import axios from 'axios';
import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';
class NewTournament extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      title: '',
      game_id: '',
      ladder_id: '',
      banner_url: '',
      min_players: '',
      gamer_tag: '',
      member_tournament: 'no',
      rules: '',
      max_players: '',
      games: [],
      ladders: []
    };
    this.banner_url_ref = React.createRef();
  }

  doClose() {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    setTimeout(() => {
      this.props.dispatch(
        closeModal({
          id: 'newtournament'
        })
      );
    }, 500);
  }

  returnOptionForMaxPPT() {
    if (!this.state.ladder_id) {
      return false;
    }
    let ld = this.state.ladders.filter(a => {
      if (this.state.ladder_id == a.id) {
        return true;
      }
      return false;
    });
    // console.log(ld);
    if (ld.length) {
      ld = ld[0];
      const a = [];
      for (let i = ld.min_players; i <= ld.max_players; i++) {
        a.push(i);
      }
      return a.map((b, i) => {
        return (
          <option value={b} key={b}>
            {b}v{b}
          </option>
        );
      });
    }
    return false;
  }

  componentDidMount() {
    this.loadData();
  }
  loadData() {
    Fetcher.get(
      '/api/admin/listPaged/games?per_page=10000&page=' + this.state.page
    )
      .then(resp => {
        if (resp.ok) {
          this.setState({
            loaded: true,
            games: resp.items,
            pagination: resp.pagination ? resp.pagination : {}
          });
        } else {
          this.props.dispatch({
            type: 'FAILURE',
            messages: [resp]
          });
        }
      })
      .catch(err => {
        // console.log(err);
        const msg = 'Failed to load users';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  loadLadder(id) {
    this.setState({
      loaded: false,
      ladder_id: ''
    });
    Fetcher.get(
      '/api/admin/listPaged/ladders?filter_game_id=' +
        id +
        '&per_page=10000&page=1'
    )
      .then(resp => {
        if (resp.ok) {
          this.setState({
            loaded: true,
            ladders: resp.items
            // pagination: resp.pagination ? resp.pagination : {}
          });
        } else {
          this.props.dispatch({
            type: 'FAILURE',
            messages: [resp]
          });
        }
      })
      .catch(err => {
        // console.log(err);
        const msg = 'Failed to load users';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  uploadFile2() {
    const data = new FormData();

    const node = this.banner_url_ref.current;
    if (!node.files || node.files.length == 0) {
      this.finalSubmit();
      return;
    }
    const file_1 = node.files[0];
    data.append('file', file_1, file_1.name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          // this.setState({
          //   loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          // });
        }
      })
      .then(res => {
        this.setState(
          {
            banner_url: res.data.file
          },
          () => {
            this.finalSubmit();
          }
        );
      })
      .catch(err => {
        alert('some error occoured.');
        this.setState({
          loaded: true
        });
        // console.log(err);
      });
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState(
      {
        loaded: false
      },
      () => {
        this.uploadFile2();
      }
    );
  }

  finalSubmit() {
    this.setState({
      loaded: false
    });

    Fetcher.post('/api/tournaments/add', {
      title: this.state.title,
      game_id: this.state.game_id,
      member_tournament: this.state.member_tournament,
      ladder_id: this.state.ladder_id,
      max_players: this.state.max_players,
      total_teams: this.state.total_teams,
      starts_at: new Date(this.state.starts_at).toUTCString(),
      registration_start_at: new Date(
        this.state.registration_start_at
      ).toUTCString(),
      registration_end_at: new Date(
        this.state.registration_end_at
      ).toUTCString(),
      entry_fee: this.state.entry_fee,
      first_winner_price: this.state.first_winner_price,
      second_winner_price: this.state.second_winner_price,
      third_winner_price: this.state.third_winner_price,
      banner_url: this.state.banner_url
    })
      .then(resp => {
        if (resp.ok) {
          this.props.onComplete && this.props.onComplete();
          this.doClose();
          this.setState({
            loaded: true
          });
        } else {
          this.setState({
            loaded: true
          });
          this.props.dispatch({type: 'FAILURE', messages: [resp]});
        }
      })
      .catch(err => {
        // console.log(err);
        this.setState({
          loaded: true
        });
        const msg = 'Failed to perform Action';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
    if (event.target.name == 'game_id') {
      // alert(event.target.value);
      this.loadLadder(event.target.value);
    }
  }

  render() {
    return (
      <div className="">
        {this.state.loaded ? (
          false
        ) : (
          <div className="show_loader">
            <div className="is_loader" />
          </div>
        )}
        <div>
          <div className="modal-body report_left_inner more_info_de">
            <form
              onSubmit={e => {
                this.onSubmit(e);
              }}
            >
              <Messages messages={this.props.messages} />

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  onChange={this.handleChange.bind(this)}
                  id="title"
                  value={this.state.title}
                  required
                  placeholder="Tournament Title"
                  className="form-control"
                />
              </div>

              <div className="input-control">
                <label>Game</label>
                <select
                  className="form-control"
                  name="game_id"
                  onChange={this.handleChange.bind(this)}
                  id="game_id"
                  value={this.state.game_id}
                  required
                >
                  <option value="">Select</option>
                  {this.state.games.map((g, i) => {
                    return (
                      <option value={g.id} key={g.id}>
                        {g.title}
                      </option>
                    );
                  })}
                </select>
              </div>
              <br />

              <div className="input-control">
                <label>Ladder</label>
                <select
                  className="form-control"
                  name="ladder_id"
                  onChange={this.handleChange.bind(this)}
                  id="ladder_id"
                  value={this.state.ladder_id}
                  required
                >
                  <option value="">Select</option>
                  {this.state.ladders &&
                    this.state.ladders.map((g, i) => {
                      return (
                        <option value={g.id} key={g.id}>
                          {g.title}
                        </option>
                      );
                    })}
                </select>
              </div>
              <br />

              <div className="form-group">
                <label>Total number of Teams</label>
                <select
                  required
                  placeholder="Total Number of Teams"
                  className="form-control"
                  name="total_teams"
                  onChange={this.handleChange.bind(this)}
                  id="total_teams"
                  value={this.state.total_teams}
                >
                  <option value="">Select</option>
                  <option value="4">4 Teams</option>
                  <option value="8">8 Teams</option>
                  <option value="16">16 Teams</option>
                </select>
              </div>

              <div className="form-group">
                <label>Members only Tournament</label>
                <select
                  required
                  placeholder="Members only Tournament"
                  className="form-control"
                  name="member_tournament"
                  onChange={this.handleChange.bind(this)}
                  id="member_tournament"
                  value={this.state.member_tournament}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Users Per Team</label>
                <select
                  required
                  placeholder="Users Per Team"
                  className="form-control"
                  name="max_players"
                  onChange={this.handleChange.bind(this)}
                  id="max_players"
                  value={this.state.max_players}
                >
                  <option value="">Select</option>
                  {this.returnOptionForMaxPPT()}
                </select>
              </div>

              <div className="form-group">
                <label>Tournament Starts On</label>
                <input
                  type="datetime-local"
                  name="starts_at"
                  onChange={this.handleChange.bind(this)}
                  id="starts_at"
                  value={this.state.starts_at}
                  required
                  placeholder="Enter Tournament Start Date Time"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Registration Starts On</label>
                <input
                  type="datetime-local"
                  name="registration_start_at"
                  onChange={this.handleChange.bind(this)}
                  id="registration_start_at"
                  value={this.state.registration_start_at}
                  required
                  placeholder="Registration Start Date Time"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Registration ends on</label>
                <input
                  type="datetime-local"
                  name="registration_end_at"
                  onChange={this.handleChange.bind(this)}
                  id="registration_end_at"
                  value={this.state.registration_end_at}
                  required
                  placeholder="Registration End Date Time"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Entry Fee (credits)</label>
                <input
                  type="number"
                  name="entry_fee"
                  onChange={this.handleChange.bind(this)}
                  id="entry_fee"
                  value={this.state.entry_fee}
                  required
                  placeholder="Entry Fee"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>First Price - OCG Cash</label>
                <input
                  type="number"
                  name="first_winner_price"
                  onChange={this.handleChange.bind(this)}
                  id="first_winner_price"
                  value={this.state.first_winner_price}
                  required
                  placeholder="First Winner - Price Amount"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Second Price - OCG Cash</label>
                <input
                  type="number"
                  name="second_winner_price"
                  onChange={this.handleChange.bind(this)}
                  id="second_winner_price"
                  value={this.state.second_winner_price}
                  required
                  placeholder="Second Winner - Price Amount"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Third Price - OCG Cash</label>
                <input
                  type="number"
                  name="third_winner_price"
                  onChange={this.handleChange.bind(this)}
                  id="third_winner_price"
                  value={this.state.third_winner_price}
                  required
                  placeholder="Third Winner - Price Amount"
                  className="form-control"
                />
              </div>
              <div className="input-control">
                <label>Tournament Banner</label>
                <input
                  type="file"
                  className="form-control"
                  name="banner_url"
                  ref={this.banner_url_ref}
                  // onChange={this.handleChange.bind(this)}
                  id="banner_url"
                />
                <small className="alert alert-notice">
                  If you do not select a banner for tournaments, it will use the
                  selected game's banner
                </small>
              </div>
              <br />

              <br />
              <input
                value="Create Tournament"
                type="submit"
                className="btn btn-primary"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    modals: state.modals.modals,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(NewTournament);
