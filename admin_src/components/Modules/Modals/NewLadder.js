import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import moment from 'moment';
import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';
class NewLadder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      title: '',
      game_id: '',
      min_players: '',
      gamer_tag: '',
      rules: '',
      max_players: '',
      games: []
    };
  }

  doClose() {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    setTimeout(() => {
      this.props.dispatch(
        closeModal({
          id: 'newladder'
        })
      );
    }, 500);
  }

  componentDidMount() {
    this.loadData();
    // this.process();
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

  onSubmit(e) {
    e.preventDefault();
    this.setState({
      loaded: false
    });

    Fetcher.post('/api/ladder/add', {
      title: this.state.title,
      game_id: this.state.game_id,
      min_players: this.state.min_players,
      max_players: this.state.max_players,
      rules: this.state.rules,
      gamer_tag: this.state.gamer_tag
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
  }

  render() {
    // const {data} = this.props;
    // console.log(data);
    return (
      <div className="">
        {this.state.loaded ? (
          false
        ) : (
          <div className="show_loader">
            <div className="is_loader" />
            sdf
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
              <div className="input-control">
                <label>Ladder Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  name="title"
                  onChange={this.handleChange.bind(this)}
                  id="title"
                  value={this.state.title}
                />
              </div>
              <br />
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
                <label>User Gamer Tag</label>
                <select
                  className="form-control"
                  name="gamer_tag"
                  onChange={this.handleChange.bind(this)}
                  id="gamer_tag"
                  value={this.state.gamer_tag}
                  required
                >
                  <option value="">Select</option>
                  <option value="1">Xbox Live Gamertag</option>
                  <option value="2">PSN</option>
                  <option value="3">Epic Games Username</option>
                  <option value="4">Steam Username</option>
                  <option value="5">Battletag</option>
                  <option value="6">Activision ID</option>
                </select>
              </div>
              <br />
              <div className="input-control">
                <label>Ladder Min players</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max={this.state.max_players ? this.state.max_players : 99999}
                  name="min_players"
                  onChange={this.handleChange.bind(this)}
                  id="min_players"
                  value={this.state.min_players}
                />
              </div>

              <br />

              <div className="input-control">
                <label>Ladder Max players</label>
                <input
                  type="number"
                  className="form-control"
                  min={this.state.min_players ? this.state.min_players : 1}
                  name="max_players"
                  onChange={this.handleChange.bind(this)}
                  id="max_players"
                  value={this.state.max_players}
                />
              </div>
              <br />

              <div className="input-control">
                <label>Rules</label>
                <textarea
                  className="form-control"
                  name="rules"
                  onChange={this.handleChange.bind(this)}
                  id="rules"
                  value={this.state.rules}
                />
              </div>
              <br />
              <input
                value="Create Ladder"
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

export default connect(mapStateToProps)(NewLadder);
