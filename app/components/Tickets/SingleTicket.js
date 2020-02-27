import React from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import Messages from '../Modules/Messages';
import moment from 'moment';
import {Link} from 'react-router';

class SingleTicket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page_loaded: false,
      items: [],
      text: '',
      new_post_image: '',
      ticket: {user: {first_name: '', last_name: ''}}
    };
  }

  submitForm(event) {
    if (this.state.submit_started) {
      return false;
    }
    this.setState({
      submit_started: true
    });
    event && event.preventDefault();
    fetch('/api/ticket_replies/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: this.state.text,
        ticket_id: this.state.ticket.id,
        attachment: this.state.new_post_image ? this.state.new_post_image : ''
      })
    }).then(rawResponse => {
      rawResponse
        .json()
        .then(json => {
          const element = document.getElementById('less_padding');
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest'
            });
          }
          if (rawResponse.ok) {
            this.props.dispatch({
              type: 'SUCCESS',
              messages: Array.isArray(json) ? json : [json]
            });
            if (this.state.text == 'CODE:ESCILATE') {
              setTimeout(function() {
                window.location.reload();
              }, 2000);
              return false;
            }
            this.setState(
              {
                text: '',
                cur_page: 1,

                submit_started: false
              },
              () => {
                this.fetchReplies();
              }
            );
          } else {
            this.props.dispatch({
              type: 'FAILURE',
              messages: Array.isArray(json) ? json : [json]
            });
            this.setState({
              submit_started: false
            });
          }
        })
        .catch(err => {
          this.setState({
            submit_started: false
          });
          const json = {ok: false, msg: 'Some error occoured'};
          this.props.dispatch({
            type: 'FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
    });
    // const content = await rawResponse.json();

    // console.log(content);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    fetch('/api/tickets/single/' + this.props.params.ticket_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              page_loaded: true,

              ticket: json.item
            },
            () => {
              this.fetchReplies();
            }
          );
        } else {
          if (json.msg) {
            this.props.dispatch({
              type: 'FAILURE',
              messages: [json]
            });
          }
          this.setState({
            is_page: false,
            page_loaded: false,
            is_404: true
          });
        }
      })
      .catch(a => {
        // console.log(a);
      });
  }
  fetchReplies() {
    // var item_id =
    // const paged = this.state.cur_page;
    fetch('/api/ticket_replies/list?ticket_id=' + this.props.params.ticket_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            items: json.items
          });
        } else {
          this.setState({
            is_page: false,
            is_loaded: true
          });
        }
      });
  }

  askFile(cls, cb) {
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          //
        }
      })
      .then(res => {
        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured in uploading file..');
        this.setState({
          upload_started: false
        });
        // console.log(err);
      });
  }

  handleImageUpload = event => {
    this.setState(
      {
        post_image_select: event.target.files[0],
        upload_started: true,
        uploaded: false
      },
      () => {
        this.askFile('post_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_post_image: data.file,
              upload_started: false,
              uploaded: true
            });
          }
        });
      }
    );
  };

  renderDownloadAttachment(a) {
    if (!a) {
      return false;
    }

    const split = a.split('.');
    const split_le = split.length;
    let ext = split[split_le - 1];
    ext = ext.toLowerCase();
    if (
      ext == 'jpg' ||
      ext == 'png' ||
      ext == 'jpeg' ||
      ext == 'gif' ||
      ext == 'bmp'
    ) {
      return (
        <a download href={a} className="text-center dib">
          <img
            style={{width: '500px'}}
            className="img_fluid thumbnail"
            src={a}
          />
          <br />
          <small>Click to download</small>
        </a>
      );
    }
    if (
      ext == 'mp4' ||
      ext == 'webm' ||
      ext == 'mov' ||
      ext == 'ogv' ||
      ext == 'webp' ||
      ext == 'mpeg' ||
      ext == 'ogg'
    ) {
      return (
        <>
          <video src={a} controls>
            This is fallback content to display for user agents that do not
            support the video tag.
          </video>
          <br />
          <a download href={a}>
            <small className="text-center">Click to download</small>
          </a>
        </>
      );
    }
    return (
      <a download href={a}>
        Download attachment
      </a>
    );
  }

  render() {
    return (
      <div>
        <section
          className="page_title_bar less_padding noblend"
          id="less_padding"
        >
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                {this.state.is_404 ? (
                  <div className="section-headline white-headline text-left">
                    <h3>Not allowed to view this ticket</h3>
                  </div>
                ) : this.state.page_loaded ? (
                  <div className="section-headline white-headline text-left">
                    <p>
                      <strong>{this.state.ticket.title}</strong>
                    </p>
                    <p>
                      Started {moment(this.state.ticket.created_at).fromNow()} |{' '}
                      {this.state.ticket.type}
                    </p>
                  </div>
                ) : (
                  false
                )}
                {this.state.ticket.status == 'closed' &&
                this.props.user.prime &&
                this.props.user.id == this.state.ticket.user.id ? (
                  <button
                    className="btn btn-primary m-0 max-width-200 dib"
                    type="button"
                    onClick={() => {
                      this.setState(
                        {
                          text: 'CODE:ESCILATE'
                        },
                        this.submitForm
                      );
                    }}
                  >
                    {this.state.submit_started
                      ? 'please wait...'
                      : 'Escalate Ticket'}
                  </button>
                ) : (
                  false
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part" id="contet_part">
          <div className="container">
            <Messages messages={this.props.messages} />

            {this.state.is_404 ? (
              false
            ) : this.state.page_loaded ? (
              <div className="col-sm-12">
                <div className="card post">
                  <div className="row">
                    <div className="col-sm-3 ticket_item_av">
                      <span className="profile_menu_item ticket_item">
                        <span className="profile_menu_item_inner">
                          <span className="menu_avatar">
                            <img
                              src={
                                this.state.ticket.user.profile_picture
                                  ? this.state.ticket.user.profile_picture
                                  : this.state.ticket.user.gravatar
                              }
                              className="img-fluid profile_pic_outline"
                            />
                          </span>
                          <span className="menu_prof_name_w">
                            <span className="menu_prof_name_top">
                              By @{this.state.ticket.user.username}
                            </span>
                            <span className="menu_prof_name_bot">
                              {moment(this.state.ticket.created_at).format(
                                'lll'
                              )}
                            </span>
                          </span>
                        </span>
                      </span>
                    </div>
                    <div className="col-sm-9 post-content">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: this.state.ticket.description
                        }}
                      />
                      {this.renderDownloadAttachment(
                        this.state.ticket.attachment
                      )}
                      <hr />
                      {this.state.ticket.extra_1 ||
                      this.state.ticket.extra_2 ||
                      this.state.ticket.extra_3 ||
                      this.state.ticket.url_1 ||
                      this.state.ticket.url_2 ||
                      this.state.ticket.url_3 ? (
                        <h3>Other Details:</h3>
                      ) : (
                        false
                      )}

                      {this.state.ticket.extra_1 ? (
                        <p>
                          <strong>Match Id: </strong>{' '}
                          {this.state.ticket.extra_3 == 'MatchFinder' ? (
                            <Link to={'/m/' + this.state.ticket.extra_1}>
                              # {this.state.ticket.extra_1}
                            </Link>
                          ) : this.state.ticket.extra_3 == 'Mix-and-match' ? (
                            <Link
                              to={'/mix-and-match/' + this.state.ticket.extra_1}
                            >
                              # {this.state.ticket.extra_1}
                            </Link>
                          ) : this.state.ticket.extra_3 == 'Tournament' ? (
                            <Link
                              to={
                                '/tournament-match/' + this.state.ticket.extra_1
                              }
                            >
                              # {this.state.ticket.extra_1}
                            </Link>
                          ) : (
                            <># {this.state.ticket.extra_1}</>
                          )}
                        </p>
                      ) : (
                        false
                      )}
                      {this.state.ticket.extra_2 ? (
                        <p>
                          <strong>Team Name: </strong>{' '}
                          {this.state.ticket.extra_2}
                        </p>
                      ) : (
                        false
                      )}
                      {this.state.ticket.extra_3 ? (
                        <p>
                          <strong>Match Type: </strong>{' '}
                          {this.state.ticket.extra_3}
                        </p>
                      ) : (
                        false
                      )}
                      {this.state.ticket.url_1 ? (
                        <p>
                          <strong>URL 1: </strong>{' '}
                          <a href={this.state.ticket.url_1} target="_blank">
                            {this.state.ticket.url_1}
                          </a>
                        </p>
                      ) : (
                        false
                      )}

                      {this.state.ticket.url_2 ? (
                        <p>
                          <strong>URL 2: </strong>{' '}
                          <a href={this.state.ticket.url_2} target="_blank">
                            {this.state.ticket.url_2}
                          </a>
                        </p>
                      ) : (
                        false
                      )}

                      {this.state.ticket.url_3 ? (
                        <p>
                          <strong>URL 3: </strong>{' '}
                          <a href={this.state.ticket.url_3} target="_blank">
                            {this.state.ticket.url_3}
                          </a>
                        </p>
                      ) : (
                        false
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              false
            )}

            {this.state.items.map((item, i) => {
              return (
                <div className="col-sm-12" key={item.id}>
                  <div className="card post">
                    <div className="row">
                      <div className="col-sm-3 ticket_item_av">
                        <span
                          className={
                            'profile_menu_item ticket_item ' +
                            (item.from_admin &&
                            this.state.ticket.user_id != item.user_id
                              ? ' from_admin '
                              : ' ')
                          }
                        >
                          <span className="profile_menu_item_inner">
                            <span className="menu_avatar">
                              <img
                                src={
                                  item.user.profile_picture
                                    ? item.user.profile_picture
                                    : item.user.gravatar
                                }
                                className="img-fluid profile_pic_outline"
                              />
                            </span>
                            <span className="menu_prof_name_w">
                              <span className="menu_prof_name_top">
                                {item.from_admin &&
                                this.state.ticket.user_id != item.user_id
                                  ? 'SUPPORT STAFF'
                                  : '@' + item.user.username}
                              </span>
                              <span className="menu_prof_name_bot">
                                {moment(item.created_at).format('lll')}
                              </span>
                            </span>
                          </span>
                        </span>
                      </div>
                      <div className="col-sm-9 post-content">
                        <div dangerouslySetInnerHTML={{__html: item.content}} />
                        {this.renderDownloadAttachment(item.attachment)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="col-sm-12">
              {this.state.ticket.status == 'closed' && (
                <div className="alert alert-success">
                  This ticket has been resolved and closed by admin
                </div>
              )}
              {this.props.user &&
                (this.props.user.id == this.state.ticket.user_id ||
                  this.props.user.role == 'admin') &&
                this.state.ticket.status != 'closed' && (
                  <form onSubmit={this.submitForm.bind(this)}>
                    <fieldset>
                      <div className="form-group">
                        <textarea
                          className="form-control black_text_area"
                          id="text"
                          value={this.state.text}
                          name={'text'}
                          onChange={this.handleChange.bind(this)}
                          required
                          rows="5"
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          this.state.upload_started ||
                          !this.state.text ||
                          this.state.submit_started
                        }
                      >
                        {this.state.submit_started ? 'please wait...' : 'Reply'}
                      </button>
                      <br />
                      <br />
                      <div className="form-group">
                        Attach file:{' '}
                        <input
                          type="file"
                          className="custom-file-inputs"
                          id="customFile"
                          style={{display: 'block !important'}}
                          onChange={this.handleImageUpload}
                        />
                        {this.state.upload_started ? (
                          <span className="text text-primary">
                            uploading..please wait.
                          </span>
                        ) : (
                          false
                        )}
                        {this.state.uploaded ? (
                          <span className="text text-success">
                            uploaded..please proceed with reply submission.
                          </span>
                        ) : (
                          false
                        )}
                      </div>
                    </fieldset>
                  </form>
                )}
            </div>
          </div>
        </section>
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
// export default SingleTicket;
export default connect(mapStateToProps)(SingleTicket);
