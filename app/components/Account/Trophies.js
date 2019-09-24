import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

class Trophies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {records: {}, loaded: true, ladders: {}, rec: []};
  }

  componentDidMount() {
    // this.fetchNotifications();
  }

  fetchNotifications() {
    fetch(
      '/api/user_info/trophies?username=' +
        this.props.params.username +
        '&duration=' +
        this.props.params.duration
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const items = json.records;
          const ladders = this.state.ladders;
          const details = this.state.records;
          for (let i = items.length - 1; i >= 0; i--) {
            const ladder_id = items[i].ladder_id;
            ladders['l_' + ladder_id] = items[i].ladder;
            if (!details['l_' + ladder_id]) {
              details['l_' + ladder_id] = {wins: 0, loss: 0};
            }
            details['l_' + ladder_id].wins += items[i].wins;
            details['l_' + ladder_id].loss += items[i].loss;
          }
          this.setState({
            records: details,
            ladders: ladders,
            loaded: true
          });
        }
      });
  }

  render() {
    console.log(this.state.ladders);

    // const rec = Object.keys(this.state.ladders);
    // console.log(rec);

    const {ladders, records} = this.state;
    // console.log(records);
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3 className="no-case-change">
                    {this.props.params.type} Trophies
                  </h3>
                  <br />
                  <Link to={'/u/' + this.props.params.username}>
                    <span className="fa fa-arrow-left" /> back to profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                {this.state.loaded && (
                  <div className="alert alert-warning">No records to show</div>
                )}

                <div className="user-profile-trophies-wrapper">
                  <div className="user-profile-trophies-container">
                    {this.state.rec.map((notif, i) => {
                      return (
                        <div
                          className="single-trophy-container m-b-20"
                          key={notif}
                          style={{width: 'calc(50% - 10px)'}}
                        >
                          <div className="trophy-image">
                            <img src="/images/shield-gold.png" />
                          </div>
                          <div className="trophy-info">
                            <div className="trophy-name gold">
                              {ladders[notif].game_info.title} -{' '}
                              {ladders[notif].title}
                            </div>
                            <div className="trophy-count">
                              <span className="text-success">
                                {records[notif].wins}W
                              </span>{' '}
                              -{' '}
                              <span className="text-danger">
                                {records[notif].loss}L
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
  return {
    user: state.auth.user
  };
};

export default connect(mapStateToProps)(Trophies);
