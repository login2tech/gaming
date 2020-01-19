import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

// import NotFound from './Pages/NotFound';

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {notifications: [], loaded: false};
  }

  componentDidMount() {
    this.fetchNotifications();
  }

  deleteNotif(id, link) {
    fetch('/notifs/delete?id=' + id)
      .then(res => res.json())
      .then(json => {
        window.location.href = link;
      })
      .catch(function() {
        window.location.href = link;
      });
  }
  fetchNotifications() {
    fetch('/notifs/listMine')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            notifications: json.notifs,
            loaded: true
          });
        }
      });
  }

  render() {
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Notifications</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <a href="/notifs/delete" className="float-right">
                  Clear all notifications
                </a>
                <br />
                <br />
                {this.state.notifications.length == 0 &&
                  this.state.loaded && (
                    <div className="alert alert-warning">
                      No more notifications to show
                    </div>
                  )}
                <ul className="  notification_list_main">
                  {this.state.notifications.map((notif, i) => {
                    let lnk = '';
                    if (notif.type == 'money-8') {
                      lnk = '/mix-and-match/' + notif.object_id;
                    } else if (notif.type == 'match') {
                      lnk = '/m/' + notif.object_id;
                    } else if (notif.type == 'team_invite') {
                      lnk = '/teams/view/' + notif.object_id;
                    } else if (notif.type == 'post') {
                      lnk = '/post/' + notif.object_id;
                      // post
                    } else if ('tournament' == notif.type) {
                      lnk = '/t/' + notif.object_id;
                    } else if ('ticket' == notif.type) {
                      lnk = '/support/tickets/ticket/' + notif.object_id;
                    } else if ('follower' == notif.type) {
                      lnk = '/gotouser/' + notif.object_id;
                    } else if ('credits' == notif.type) {
                      lnk = '/my_bank';
                    }

                    return (
                      <li key={notif.id}>
                        <a
                          onClick={e => {
                            e.preventDefault();
                            this.deleteNotif(notif.id, lnk);
                          }}
                          href={lnk}
                        >
                          {notif.description}
                          <br />
                          <small>{moment(notif.created_at).fromNow()}</small>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return state;
};

export default connect(mapStateToProps)(Notifications);
