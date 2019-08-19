import React from 'react';
import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
import Messages from '../Modules/Messages';
import moment from 'moment';

class SingleTicket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page_loaded: false,
      items: [],
      text: '',
      ticket: {user: {first_name: '',last_name:''}}
    };
  }

  submitForm(event) {
    event.preventDefault();
    fetch('/api/ticket_replies/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: this.state.text,
        ticket_id: this.state.ticket.id
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
    fetch('/api/tickets/single/' + this.props.params.ticket_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              ticket: json.item
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
    // const paged = this.state.cur_page;
    fetch('/api/ticket_replies/list?ticket_id=' + this.props.params.ticket_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            items: json.items
            // pageCount: json.pagination.pageCount
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
                  <h3>{this.state.ticket.title}</h3>
                  <p>
                    Started {moment(this.state.ticket.created_at).fromNow()} |{' '}
                    {this.state.ticket.type}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part" id="contet_part">
          <div className="container">
            <Messages messages={this.props.messages} />

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
                            By{' '}
                            {this.state.ticket.user.first_name +
                              ' ' +
                              this.state.ticket.user.last_name}
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
                    {this.state.ticket.attachment ? (
                      <a download href={this.state.ticket.attachment}>
                        Download attachment
                      </a>
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
                        <span className={"profile_menu_item ticket_item "+(item.from_admin ? ' from_admin ' :' ')}>
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
                              {
                                item.from_admin ? 'SUPPORT STAF' : ''+item.user.first_name +
                                  ' ' +
                                  item.user.last_name
                              } 
                                
                              </span>
                              <span className="menu_prof_name_bot">
                                {moment(item.created_at).format(
                                  'lll'
                                )}
                              </span>
                            </span>
                          </span>
                        </span>
                      </div>
                      <div className="col-sm-9 post-content">
                        <div
                          dangerouslySetInnerHTML={{__html: item.content}}
                        />
                        {item.attachment ? (
                          <a download href={item.attachment}>
                            Download attachment
                          </a>
                        ) : (
                          false
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="col-sm-12">
              {this.props.user &&
                this.props.user.id == this.state.ticket.user_id && (
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
// export default SingleTicket;
export default connect(mapStateToProps)(SingleTicket);
