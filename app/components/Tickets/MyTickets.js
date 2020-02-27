import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
class Tickets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page_loaded: false,
      showing_closed: false,
      items: []
    };
  }

  checkboxChange() {
    this.setState({showing_closed: !this.state.showing_closed});
  }

  componentDidMount() {
    fetch('/api/tickets/my')
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

  render() {
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
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
              className="nav  nav-tabs responsive-tabs"
              role="tablist"
              style={{marginBottom: 40, justifyContent: 'space-between'}}
            >
              <li
                role="presentation"
                style={{float: 'left'}}
                className=" text-right"
              >
                <label>
                  <input
                    type="checkbox"
                    onChange={this.checkboxChange.bind(this)}
                  />{' '}
                  Show closed tickets too ?
                </label>
              </li>
              <li role="presentation" className="pull-right text-right">
                <Link to="/support/tickets/create" role="tab">
                  <i className="fa fa-plus" /> Create New
                </Link>
              </li>
            </ul>

            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="table_wrapper">
                  <table
                    ref={element => (this.table = element)}
                    className="table table-striped table-ongray table-hover"
                  >
                    <thead>
                      <tr>
                        <th width="30">ID</th>
                        <th>Title</th>
                        <th className="d-none d-md-table-cell">Department</th>
                        <th className="d-none d-md-table-cell">Last Updated</th>
                        <th className="d-none d-md-table-cell">Status</th>
                        <th>View Ticket</th>
                        <th style={{width: '10%'}} className="d-md-none" />
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.items.map((item, i) => {
                        if (
                          this.state.showing_closed == false &&
                          item.status == 'closed'
                        ) {
                          return false;
                        }
                        return (
                          <React.Fragment key={item.id}>
                            <tr>
                              <td>{item.id}</td>
                              <td>
                                <a href={'/support/tickets/ticket/' + item.id}>
                                  {item.title}
                                </a>
                              </td>
                              <td className="d-none d-md-table-cell">
                                {item.type}
                              </td>
                              <td className="d-none d-md-table-cell">
                                {moment(item.updated_at).fromNow()}
                              </td>
                              <td className="d-none d-md-table-cell">
                                {item.status == 'closed' ? (
                                  <span className="text-success">Closed</span>
                                ) : item.status == 'escilated' ? (
                                  <span className="text-primary">
                                    Escilated
                                  </span>
                                ) : (
                                  <span className="text-primary">Open</span>
                                )}
                              </td>
                              <td>
                                <a href={'/support/tickets/ticket/' + item.id}>
                                  View Ticket
                                </a>
                              </td>
                              <td className="d-md-none">
                                <button
                                  className="btn btn-link"
                                  onClick={() => {
                                    this.setState({
                                      expanded:
                                        item.id == this.state.expand_id
                                          ? !this.state.expanded
                                          : true,
                                      expand_id: item.id
                                    });
                                  }}
                                >
                                  <span
                                    className={
                                      this.state.expanded &&
                                      this.state.expand_id == item.id
                                        ? ' fa fa-minus'
                                        : ' fa fa-plus '
                                    }
                                  />
                                </button>
                              </td>
                            </tr>
                            {this.state.expanded &&
                            this.state.expand_id == item.id ? (
                              <tr>
                                <td colSpan="4">
                                  <table className="table">
                                    <tbody>
                                      <tr>
                                        <td>Department</td>
                                        <td>{item.type}</td>
                                      </tr>
                                      <tr>
                                        <td>Last Updated</td>
                                        <td>
                                          {moment(item.updated_at).fromNow()}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Status</td>
                                        <td>
                                          {item.status == 'closed' ? (
                                            <span className="text-success">
                                              Closed
                                            </span>
                                          ) : item.status == 'escilated' ? (
                                            <span className="text-primary">
                                              Escilated
                                            </span>
                                          ) : (
                                            <span className="text-primary">
                                              Open
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            ) : (
                              false
                            )}
                          </React.Fragment>
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
