import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import Messages from '../Modules/Messages';
import moment from 'moment';
import ReactPaginate from 'react-paginate';

class SingleThread extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page_loaded: false,
      items: [],
      text: '',
      thread: {user: {}},
      pageCount: 1,
      cur_page: this.props.params.page
    };
  }

  submitForm(event) {
    event.preventDefault();
    // fetch(, function(){

    fetch('/api/thread_replies/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: this.state.text,
        thread_id: this.state.thread.id
      })
    }).then(rawResponse => {
      rawResponse
        .json()
        .then(json => {
          if (rawResponse.ok) {
            this.props.dispatch({
              type: 'SUCCESS',
              messages: Array.isArray(json) ? json : [json]
            });
            this.setState(
              {
                text: '',
                cur_page: 1
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
          }
        })
        .catch(err => {
          const json = {ok: false, msg: 'Some error occoured'};
          this.props.dispatch({
            type: 'FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
    });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    fetch('/api/thread/single/' + this.props.params.thread_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              thread: json.item
            },
            () => {
              this.fetchReplies();
            }
          );
        } else {
          this.setState({
            is_page: false,
            is_loaded: true
          });
        }
      });
  }

  fetchReplies() {
    // var item_id =
    const paged = this.state.cur_page;
    fetch(
      '/api/thread_replies/listPaged?thread_id=' +
        this.props.params.thread_id +
        '&paged=' +
        paged
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            items: json.items,
            pageCount: json.pagination.pageCount
          });
        } else {
          this.setState({
            is_page: false,
            is_loaded: true
          });
        }
      });
  }

  render() {
    return (
      <div>
        <section className="page_title_bar noblend" id=" ">
          <div className="container ticket_header">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline m-0 white-headline text-left">
                  <h3>{this.state.thread.title}</h3>
                  <h5 className="text-capitalize">{this.props.params.topic}</h5>
                  <p>
                    Started by{' '}
                    <a href={'/u/' + this.state.thread.user.username}>
                      {this.state.thread.user.username}
                    </a>{' '}
                    {moment(this.state.thread.created_at).fromNow()}
                  </p>
                  <div className="banner_actions">
                    <a
                      href="/forums"
                      className=""
                      onClick={e => {
                        if (history.length == 1) {
                          return;
                        }
                        history.back();
                        e.preventDefault();
                      }}
                    >
                      <span className="fa fa-arrow-left" /> back to threads
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part single_ticket" id="contet_part">
          <div className="container">
            <div className="col-sm-12">
              <div className="card post post-main">
                <span className="date">
                  {moment(this.state.thread.created_at).format('lll')}
                </span>
                <div className="row">
                  <div className="col-sm-12 col-md-3 ticket_item_av">
                    <span className="profile_menu_item ticket_item">
                      <span className="profile_menu_item_inner">
                        <span className="menu_avatar">
                          <img
                            src={
                              this.state.thread.user.profile_picture
                                ? this.state.thread.user.profile_picture
                                : this.state.thread.user.gravatar
                            }
                            className="img-fluid profile_pic_outline"
                          />
                        </span>
                        <span className="menu_prof_name_w">
                          <span className="menu_prof_name_top">
                            By{' '}
                            <Link to={'/u/' + this.state.thread.user.username}>
                              @{this.state.thread.user.username}
                            </Link>
                          </span>
                          <span className="menu_prof_name_bot">
                            {moment(this.state.thread.created_at).format('lll')}
                          </span>
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="col-sm-9 post-content">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: this.state.thread.description
                      }}
                    />
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
                        <span className="profile_menu_item ticket_item">
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
                                By{' '}
                                <Link to={'/u/' + item.user.username}>
                                  @{item.user.username}
                                </Link>
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="col-sm-12">
              <ReactPaginate
                previousLabel={'«'}
                nextLabel={'»'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                containerClassName={'pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active page-item'}
                initialPage={parseInt(this.state.cur_page) - 1}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link'}
                pageCount={this.state.pageCount}
                previousClassName={'page-item'}
                nextClassName={'page-item'}
                disableInitialCallback
                onPageChange={data => {
                  this.setState({cur_page: data.selected + 1}, () => {
                    this.fetchReplies();
                    history.pushState(
                      {},
                      'page ' + (data.selected + 1),
                      '/forums/thread/' +
                        this.props.params.thread_id +
                        '/page/' +
                        (data.selected + 1) +
                        '/'
                    );
                  });
                  const element = document.getElementById('less_padding');
                  if (element) {
                    element.scrollIntoView({
                      behavior: 'smooth',
                      block: 'end',
                      inline: 'nearest'
                    });
                  }
                  return true;
                }}
                previousLinkClassName={'page-link'}
                nextLinkClassName={'page-link'}
              />
            </div>

            <div className="col-sm-12">
              {this.props.user && (
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
                    <button type="submit" className="btn btn-primary">
                      Add Comment
                    </button>
                  </fieldset>
                  <br />
                  <br />
                  <Messages messages={this.props.messages} />
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
// export default SingleThread;
export default connect(mapStateToProps)(SingleThread);
