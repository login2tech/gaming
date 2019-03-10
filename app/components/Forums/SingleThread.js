import React from 'react';
import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
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
      // page:thi.
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
          // console.log(json);
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
    // const content = await rawResponse.json();

    // console.log(content);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
  componentWillUnmount() {
    // this.serverRequest.abort();
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
        <section className="page_title_bar less_padding" id="less_padding">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>{this.state.thread.title}</h3>
                  <p>
                    Started by{' '}
                    <a href={'/u/' + this.state.thread.user.username}>
                      {this.state.thread.user.username}
                    </a>{' '}
                    {moment(this.state.thread.created_at).fromNow()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part" id="contet_part">
          <div className="container">
            <Messages messages={this.props.messages} />

            {this.state.items.map((item, i) => {
              return (
                <div className="col-sm-12" key={item.id}>
                  <div className="card post">
                    <span className="date">
                      {moment(item.created_at).format('lll')}
                    </span>
                    <div className="row">
                      <div className="col-sm-3 user">
                        <div className="text-center">
                          <img
                            src={item.user && item.user.gravatar}
                            width="90"
                            height="140"
                            className="img-fluid center-block"
                          />
                          <h3>
                            {item.user.first_name} {item.user.last_name}
                          </h3>
                          {/*}<p>Been spending a lot of time on here!</p>*/}
                          <table style={{width: '100%'}}>
                            <tbody>
                              <tr>
                                <th>Joined:</th>
                                <td>
                                  {moment(item.user.created_at).format('lll')}
                                </td>
                              </tr>
                              {/*}<tr>
                              <th>Messages:</th>
                              <td>22,358</td>
                            </tr>
                            <tr>
                              <th>Likes:</th>
                              <td>7,514</td>
                            </tr>*/}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="col-sm-9 post-content">
                        <div dangerouslySetInnerHTML={{__html: item.content}} />
                      </div>
                    </div>
                    {/*}<span className="likes">
                    3 users liked this{' '}
                    <span className="span-post-no">
                      <a href="">Like</a>
                    </span>{' '}
                    <span className="span-post-no">
                      <a href="">Quote</a>
                    </span>
                  </span>*/}
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
                  return true;
                }}
                previousLinkClassName={'page-link'}
                nextLinkClassName={'page-link'}
                hrefBuilder={page =>
                  '/forums/thread/' +
                  this.props.params.thread_id +
                  '/page/' +
                  page +
                  '/'
                }
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
                      Reply
                    </button>
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
// export default SingleThread;
export default connect(mapStateToProps)(SingleThread);
