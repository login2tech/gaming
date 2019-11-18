import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import moment from 'moment';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

class Tickets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page_loaded: false,
      items: []
    };
  }

  componentDidMount() {
    fetch('/api/tickets/my')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              items: json.items
            },
            () => {
              // this.fetchReplies();
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

  render() {
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Support Center</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container content_box">
            <ul
              className="nav  justify-content-end nav-tabs responsive-tabs"
              role="tablist"
              style={{marginBottom: 40}}
            >
              <li role="presentation" className="pull-right text-right">
                <Link to="/support/tickets/create" role="tab">
                  <i className="fa fa-plus" /> Create New
                </Link>
              </li>
            </ul>

            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="table_wrapper">
                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        <th width="30">ID</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Last Updated</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.items.map((item, i) => {
                        return (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>
                              <a href={'/support/tickets/ticket/' + item.id}>
                                {item.title}
                              </a>
                            </td>
                            <td>{item.type}</td>
                            <td>{moment(item.updated_at).fromNow()}</td>
                            <td>{item.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
export default connect(mapStateToProps)(Tickets);
