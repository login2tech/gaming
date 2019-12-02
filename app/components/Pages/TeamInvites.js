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
        <section className="page_title_bar">
          <div className="container">
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
                    <div className="table_wrapper">
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th style={{width: '10%'}}>Team Id</th>
                            <th>Team Name</th>
                            <th>Team Type</th>
                            <th>Invited on</th>
                            <th style={{width: '15%'}}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invites.map((m, i) => {
                            console.log(m);
                            const k = m.team_info;
                            return (
                              <tr key={k.id}>
                                <td>{k.id}</td>
                                <td>
                                  <h5>
                                    <Link to={'/teams/view/' + k.id}>
                                      {k.title}
                                    </Link>
                                  </h5>
                                  <small>
                                    {k.ladder.game_info.title} -{' '}
                                    {k.ladder.title}
                                  </small>
                                </td>
                                <td>{k.team_type}</td>
                                <td>{moment(m.created_at).format('LLL')}</td>

                                <td>
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
                              </tr>
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
