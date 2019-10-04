import React from 'react';
import {connect} from 'react-redux';
import {openModal, closeModal} from '../../actions/modals';

import {add_post} from '../../actions/social';
import axios from 'axios';
class NewPost extends React.Component {
  state = {
    new_post_type: 'text',
    new_post_content: '',
    new_post_image: '',
    new_post_video: ''
  };

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  doPostNew(event) {
    event.preventDefault();

    this.props.dispatch(
      add_post(
        {
          post_type: this.state.new_post_type,
          image_url: this.state.new_post_image,
          video_url: this.state.new_post_video,
          content: this.state.new_post_content,

          is_in_timeline: this.props.is_in_timeline ? true : false,
          timeline_of: this.props.is_in_timeline
            ? this.props.user_info.id
            : null,
          is_private: this.props.is_private ? true : false
        },
        this.props.token,
        (result, post) => {
          if (result && post) {
            this.setState({
              post_type: 'text',
              image_url: '',
              video_url: '',
              content: ''
            });
            this.props.dispatch(
              openModal({
                id: 'trello_snack',
                type: 'snackbar',
                zIndex: 1076,
                content: 'Your Post has been added.'
              })
            );
            setTimeout(() => {
              this.props.dispatch(
                closeModal({
                  id: 'trello_snack'
                })
              );
              // window.location.reload();
            }, 4000);

            post.user = this.props.user;
            this.props.onSubmit && this.props.onSubmit(post);
          }
        }
      )
    );
  }

  handleImageUpload = event => {
    this.setState(
      {
        post_image_select: event.target.files[0],
        uploading_image: true
      },
      () => {
        this.askFile('post_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_post_image: data.file,
              uploading_image: false
            });
          }
        });
      }
    );
  };

  handleVideoUpload = event => {
    this.setState(
      {
        post_video_select: event.target.files[0],
        uploading_video: false
      },
      () => {
        this.askFile('post_video_select', data => {
          if (data && data.file) {
            this.setState({
              new_post_video: data.file,
              uploading_video: false
            });
          }
        });
      }
    );
  };

  askFile(cls, cb) {
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            progressDone: (
              (ProgressEvent.loaded * 100) /
              ProgressEvent.total
            ).toFixed(2)
          });
        }
      })
      .then(res => {
        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured.');
        // console.log(err);
      });
  }

  render() {
    return (
      <div>
        <form
          onSubmit={event => {
            this.doPostNew(event);
          }}
        >
          <div className="card gedf-card">
            <div className="card-header">
              <ul
                className="nav nav-tabs card-header-tabs"
                id="myTab"
                role="tablist"
              >
                <li className="nav-item">
                  <a
                    className={
                      'nav-link' +
                      (this.state.new_post_type == 'text' ? ' active ' : '')
                    }
                    id="posts-tab"
                    // data-toggle="tab"
                    // href="#posts"
                    // role="tab"
                    // aria-controls="posts"
                    // aria-selected="true/"
                    onClick={() => {
                      this.setState({
                        new_post_type: 'text',
                        new_post_image: '',
                        new_post_video: '',
                        post_video_select: ''
                      });
                    }}
                  >
                    Post
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={
                      'nav-link' +
                      (this.state.new_post_type == 'image' ? ' active ' : '')
                    }
                    id="images-tab"
                    onClick={() => {
                      this.setState({
                        new_post_type: 'image',
                        // new_post_image: '',
                        new_post_video: '',
                        post_image_select: ''
                      });
                    }}
                    // data-toggle="tab"
                    // role="tab"
                    // aria-controls="images"
                    // aria-selected="false"
                    // href="#images"
                  >
                    <i className="fa fa-image" />
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={
                      'nav-link' +
                      (this.state.new_post_type == 'video' ? ' active ' : '')
                    }
                    id="videos-tab"
                    // data-toggle="tab"
                    // role="tab"
                    // aria-controls="videos"
                    // aria-selected="false"
                    // href="#videos"
                    onClick={() => {
                      this.setState({
                        new_post_type: 'video',
                        new_post_image: ''
                        // new_post_video: ''
                      });
                    }}
                  >
                    <i className="fa fa-video-camera" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tab-content" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="posts"
                  role="tabpanel"
                  aria-labelledby="posts-tab"
                >
                  {this.state.new_post_type == 'image' ? (
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="customFile"
                        onChange={this.handleImageUpload}
                      />
                      <label className="custom-file-label" htmlFor="customFile">
                        Upload image
                      </label>
                    </div>
                  ) : (
                    false
                  )}

                  {this.state.new_post_type == 'video' ? (
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="customFile"
                        onChange={this.handleVideoUpload}
                      />
                      <label className="custom-file-label" htmlFor="customFile">
                        Upload video
                      </label>
                    </div>
                  ) : (
                    false
                  )}
                  {this.state.new_post_image != '' ? (
                    <img
                      src={this.state.new_post_image}
                      className="img-fluid"
                      style={{marginBottom: '10px'}}
                    />
                  ) : (
                    false
                  )}

                  {this.state.new_post_video != '' ? (
                    <div
                      className="embed-responsive embed-responsive-21by9"
                      style={{marginBottom: '10px'}}
                    >
                      <video>
                        <source
                          src={this.state.new_post_video}
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  ) : (
                    false
                  )}

                  {this.state.new_posting ||
                  this.state.uploading_image ||
                  this.state.uploading_video ? (
                    <span>
                      <span className="fa fa-spin fa-spinner text-white" />{' '}
                      <span className="text-white">
                        {this.state.progressDone}% uploaded
                      </span>
                    </span>
                  ) : (
                    false
                  )}
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      id="new_post_content"
                      required
                      rows="3"
                      value={this.state.new_post_content}
                      placeholder="What are you thinking?"
                      name="new_post_content"
                      onChange={this.handleChange.bind(this)}
                    />
                  </div>
                </div>
              </div>

              <div className="btn-toolbar justify-content-between">
                <div className="btn-group">
                  <button type="submit" className="btn btn-primary">
                    share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
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

export default connect(mapStateToProps)(NewPost);
