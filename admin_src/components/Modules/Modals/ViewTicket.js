import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import moment from 'moment';
import React from 'react';
class ViewTicket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      items: [],
      cur_page: 1,
      ticket: {user: {first_name: '', last_name: ''}},
      pageCount: 1
    };
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'viewticket'
      })
    );
  }

  fetchData() {
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
        console.log(a);
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

  render() {
    const {data} = this.props;
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
                                  : '' +
                                    item.user.first_name +
                                    ' ' +
                                    item.user.last_name}
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
