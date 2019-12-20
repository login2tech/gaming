import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';

import axios from 'axios';
import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';

class EditGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loaded: true, title: '', image_url: '', banner_url: ''};
    this.image_url_ref = React.createRef();
    this.banner_url_ref = React.createRef();
  }

  componentDidMount() {
    this.process();
  }
  process() {
    const dt = this.props.data;
    if (this.props.data) {
      this.setState({
        title: dt.title,
        id: dt.id,
        image_url: dt.image_url,
        banner_url: dt.banner_url
      });
    }
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

  finalSubmit() {
    Fetcher.post('/api/games/edit', {
      title: this.state.title,
      id: this.state.id,
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
          this.setState({
            loaded: true
          });
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

  uploadFile2() {
    const data = new FormData();

    const node = this.banner_url_ref.current;

    const file_1 = node.files[0];
    if (!file_1) {
      this.finalSubmit();
      return;
    }
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
    this.setState({
      loaded: false
    });

    const data = new FormData();

    const node = this.image_url_ref.current;

    const file_1 = node.files[0];
    if (!file_1) {
      this.uploadFile2();
      return;
    }

    data.append('file', file_1, file_1.name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            // loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          });
        }
      })
      .then(res => {
        this.setState(
          {
            image_url: res.data.file
          },
          () => {
            this.uploadFile2();
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
                  ref={this.image_url_ref}
                  // required
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
                  // required
                  ref={this.banner_url_ref}
                  // onChange={this.handleChange.bind(this)}
                  id="banner_url"
                  // value={this.state.title}
                />
              </div>
              <br />

              <input
                value="Edit Game"
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

export default connect(mapStateToProps)(EditGame);
