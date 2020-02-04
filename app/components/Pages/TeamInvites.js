import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {approveRequest} from '../../actions/team';
class TeamInvites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invites: [],
      loaded: false
    };
  }

  approveRequest(team_id, event, reject) {
    event.preventDefault();
    this.props.dispatch(
      approveRequest(
        {
          team_id: team_id,
          mode: reject == 'reject' ? 'reject' : 'accept'
        },
        st => {
          if (st) {
            this.fetchInvites();
          }
        }
      )
    );
  }

  componentDidMount() {
    this.fetchInvites();
  }

  fetchInvites() {
    fetch('/api/teams/my_invites')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            invites: json.items,
            loaded: true
          });
        }
      });
  }

  render() {
    // if (this.state.is_loaded && !this.state.is_page) {
    //   return <NotFound />;
    // }
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>My Team Invites</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col">
                <div className="content_box">
                  <div className=" ">
                    {this.state.invites.length == 0 && this.state.loaded ? (
                      <div className="alert alert-warning">
                        You have no pending invites.
                      </div>
                    ) : (
                      false
                    )}
                    <div className="table_wrapper">
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th style={{width: '15%'}}>Team Id</th>
                            <th>Team Name</th>
                            <th className="d-md-none">Team Type</th>
                            <th className="d-none d-md-table-cell">
                              Team Type
                            </th>
                            <th className="d-none d-md-table-cell">
                              Invited on
                            </th>
                            <th
                              className="d-none d-md-table-cell"
                              style={{width: '15%'}}
                            >
                              Action
                            </th>
                            <th style={{width: '10%'}} className="d-md-none" />
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invites.map((m, i) => {
                            const k = m.team_info;
                            return (
                              <React.Fragment key={k.id}>
                                <tr>
                                  <td>{k.id}</td>
                                  <td>
                                    <h5>
                                      <Link to={'/teams/view/' + k.id}>
                                        {k.title}
                                      </Link>
                                    </h5>
                                    <small className="d-none d-md-inline-block">
                                      {k.ladder.game_info.title} -{' '}
                                      {k.ladder.title}
                                    </small>
                                  </td>
                                  <td className="d-md-none">
                                    {k.ladder.game_info.title} -{' '}
                                    {k.ladder.title}
                                  </td>
                                  <td className="d-none d-md-table-cell capitalize">
                                    {k.team_type}
                                  </td>
                                  <td className="d-none d-md-table-cell">
                                    {moment(m.created_at).format('LLL')}
                                  </td>
                                  <td className="d-none d-md-table-cell">
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={event => {
                                        this.approveRequest(k.id, event);
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={event => {
                                        this.approveRequest(
                                          k.id,
                                          event,
                                          'reject'
                                        );
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </td>
                                  <td className="d-md-none">
                                    <button
                                      className="btn btn-link"
                                      onClick={() => {
                                        this.setState({
                                          expanded:
                                            k.id == this.state.expand_id
                                              ? !this.state.expanded
                                              : true,
                                          expand_id: k.id
                                        });
                                      }}
                                    >
                                      <span
                                        className={
                                          this.state.expanded &&
                                          this.state.expand_id == k.id
                                            ? ' fa fa-minus'
                                            : ' fa fa-plus '
                                        }
                                      />
                                    </button>
                                  </td>
                                </tr>
                                {this.state.expanded &&
                                this.state.expand_id == k.id ? (
                                  <tr key={'k_' + k.id}>
                                    <td colSpan="4">
                                      <table className="table">
                                        <tbody>
                                          <tr>
                                            <td>Invited on</td>
                                            <td>
                                              {moment(m.created_at).format(
                                                'LLL'
                                              )}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td>Team Type</td>
                                            <td>{k.team_type}</td>
                                          </tr>
                                          <tr>
                                            <td colSpan="2">
                                              <button
                                                className="btn btn-sm btn-success width-100"
                                                onClick={event => {
                                                  this.approveRequest(
                                                    k.id,
                                                    event
                                                  );
                                                }}
                                              >
                                                Accept
                                              </button>
                                            </td>
                                            <td>
                                              <button
                                                className="btn btn-sm btn-danger width-100"
                                                onClick={event => {
                                                  this.approveRequest(
                                                    k.id,
                                                    event,
                                                    'reject'
                                                  );
                                                }}
                                              >
                                                Reject
                                              </button>
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

export default connect(mapStateToProps)(TeamInvites);
