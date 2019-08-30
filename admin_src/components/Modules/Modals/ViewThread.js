import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import moment from 'moment';
import React from 'react';
class ViewThread extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false, items:[], thread: {user: {}},
      pageCount: 1};
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'viewthread'
      })
    );
  }

   fetchData() {
    fetch('/api/thread/single/' + this.props.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
            
              thread: json.item
            },
            () => {
              this.fetchReplies();
            }
          );
        } else {
          this.setState({
            // is_page: false,
            // is_loaded: true
          });
        }
      });
  }

  fetchReplies() {
    // var item_id =
    const paged = this.state.cur_page;
    fetch(
      '/api/thread_replies/listPaged?thread_id=' +
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
                <span className="date">
                  {moment(this.state.thread.created_at).format('lll')}
                </span>
                <div className="row">
                  <div className="col-sm-3 ticket_item_av">
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
                            {this.state.thread.user.first_name +
                              ' ' +
                              this.state.thread.user.last_name}
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
                                {item.user.first_name +
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

export default connect(mapStateToProps)(ViewThread);
