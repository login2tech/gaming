import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import moment from 'moment';
import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';
class NewGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loaded: true, title: '', image_url: '', banner_url: ''};
  }

  doClose() {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    setTimeout(() => {
      this.props.dispatch(
        closeModal({
          id: 'newgame'
        })
      );
    }, 500);
  }
  onSubmit(e) {
    e.preventDefault();
    this.setState({
      loaded: false
    });

    Fetcher.post('/api/games/add', {
      title: this.state.title,
      image_url: this.state.image_url,
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
                <label>Game Name</label>
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
                <label>Game Image</label>
                <input
                  type="file"
                  className="form-control"
                  name="image_url"
                  // onChange={this.handleChange.bind(this)}
                  id="image_url"
                  // value={this.state.title}
                />
              </div>
              <br />
              <div className="input-control">
                <label>Game Banner</label>
                <input
                  type="file"
                  className="form-control"
                  name="banner_url"
                  // onChange={this.handleChange.bind(this)}
                  id="banner_url"
                  // value={this.state.title}
                />
              </div>
              <br />

              <input
                value="Create Game"
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

export default connect(mapStateToProps)(NewGame);
