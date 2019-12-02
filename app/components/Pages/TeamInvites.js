import React from 'react';
import {connect} from 'react-redux';

class TeamInvites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invites: [],
      loaded: false
    };
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
                      <table className="table table-stripped">
                        <thead>
                          <tr>
                            <th style={{width: '10%'}}>Team Id</th>
                            <th>Team Name</th>
                            <th>Team Type</th>
                            <th>Team Game</th>
                            <th>Invited on</th>
                            <th style={{width: '15%'}}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invites.map((k, i) => {
                            return (
                              <tr key={k.id}>
                                <td>{k.id}</td>
                                <td>{k.id}</td>
                                <td>{k.id}</td>
                                <td>{k.id}</td>
                                <td>{k.id}</td>
                                <td>Action</td>
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
