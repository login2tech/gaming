import React from 'react';
import {connect} from 'react-redux';

import SingleTournament from './SingleTournament';
class TournamentFinder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      tournaments: [],
      ladder: '',
      games: [],
      is_loaded: false
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    fetch('/api/tournaments/upcoming')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            tournaments: json.items
          });
        }
      });
  }

  matchLink(orign) {
    if (this.props.user) {
      return orign;
    }
    return '/login';
  }

  render() {
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="all_t_heading">Upcoming Tournaments</div>
                <div className="t_big_heading">Play. Win. Collect.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="content">
                  <div id="tab1_content" className="content_boxes selected">
                    {this.state.is_loaded &&
                    this.state.tournaments.length < 1 ? (
                      <div className="alert alert-warning">
                        There are no active tournaments. Please check back
                        later.
                      </div>
                    ) : (
                      false
                    )}
                    {!this.state.is_loaded ? (
                      <div className="text-center">
                        <span className="fa fa-spin fa-spinner" />
                      </div>
                    ) : (
                      false
                    )}

                    <div
                      id="upcoming-tournament"
                      className="tournament-list row"
                    >
                      {this.state.tournaments.map(tour => {
                        return <SingleTournament key={tour.id} tour={tour} />;
                      })}
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
  return {
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};
// export default SingleThread;
export default connect(mapStateToProps)(TournamentFinder);
