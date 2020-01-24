import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import moment from 'moment';
import Fetcher from '../../../actions/Fetcher';
import React from 'react';
import Messages from '../../Messages';
class ViewTicket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      items: [],
      cur_page: 1,
      ticket: {user: {first_name: '', last_name: ''}},
      pageCount: 1,
      text: ''
    };
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'viewticket'
      })
    );
  }

  fetchData(skip_replies) {
    fetch('/api/tickets/single/' + this.props.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              // page_loaded: true,

              ticket: json.item
            },
            () => {
              if (skip_replies) {
                //
              } else {
                this.fetchReplies();
              }
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
        //
      });
  }

  fetchReplies() {
    // var item_id =
    const paged = this.state.cur_page;
    fetch(
      '/api/ticket_replies/listPaged?per_page=999999&ticket_id=' +
        this.props.id +
        '&paged=' +
        paged
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            loaded: true,
            items: json.items,
            pageCount: json.pagination.pageCount
          });
        } else {
          this.setState({
            is_page: false,
            loaded: true
          });
        }
      });
  }
  componentDidMount() {
    this.fetchData();
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({
      loaded: false
    });

    Fetcher.post('/api/ticket_replies/add', {
      text: this.state.text,
      ticket_id: this.state.ticket.id
    })
      .then(resp => {
        this.setState({
          loaded: true
        });
        if (resp.ok) {
          this.setState({
            text: ''
          });
          this.fetchReplies();
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
        <a download href={a}>
          <img
            style={{width: '500px'}}
            className="img_fluid thumbnail"
            src={a}
          />
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

  closeTicketInner() {
    this.setState({
      loaded: false
    });
    Fetcher.post('/api/tickets/close', {
      ticket_id: this.state.ticket.id
    })
      .then(resp => {
        this.setState({
          loaded: true
        });
        if (resp.ok) {
          this.props.dispatch({type: 'SUCCESS', messages: [resp]});
          this.fetchData(true);
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

  closeTicket() {
    if (confirm('Are you sure you want to close this ticket')) {
      this.closeTicketInner();
    }
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
                            {moment(this.state.ticket.created_at).format('lll')}
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
                          <a
                            target="_blank"
                            href={'/m/' + this.state.ticket.extra_1}
                          >
                            # {this.state.ticket.extra_1}
                          </a>
                        ) : this.state.ticket.extra_3 == 'Mix-and-match' ? (
                          <a
                            target="_blank"
                            href={'/mix-and-match/' + this.state.ticket.extra_1}
                          >
                            # {this.state.ticket.extra_1}
                          </a>
                        ) : this.state.ticket.extra_3 == 'Tournament' ? (
                          <a
                            target="_blank"
                            href={
                              '/tournament-match/' + this.state.ticket.extra_1
                            }
                          >
                            # {this.state.ticket.extra_1}
                          </a>
                        ) : (
                          <># {this.state.ticket.extra_1}</>
                        )}
                      </p>
                    ) : (
                      false
                    )}
                    {this.state.ticket.extra_2 ? (
                      <p>
                        <strong>Team Name: </strong> {this.state.ticket.extra_2}
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
          </div>
          <div className="modal-footer">
            {this.state.ticket.status == 'closed' ? (
              false
            ) : (
              <form
                onSubmit={e => {
                  this.onSubmit(e);
                }}
              >
                <Messages messages={this.props.messages} />
                <div className="input-control">
                  <label>Reply Text</label>
                  <textarea
                    type="text"
                    required
                    className="form-control"
                    name="text"
                    onChange={this.handleChange.bind(this)}
                    id="text"
                    value={this.state.text}
                  />
                </div>
                <br />

                <input
                  value="Close Ticket"
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    this.closeTicket();
                  }}
                />

                <input
                  value="Create reply"
                  type="submit"
                  className="btn btn-primary"
                />
              </form>
            )}
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

export default connect(mapStateToProps)(ViewTicket);
