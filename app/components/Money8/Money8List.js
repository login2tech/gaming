import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
// const moment = require('moment');
// import game_user_ids from '../../../config/game_user_ids';
import {leave_match} from '../../actions/match8';
import SingleMoney8 from './SingleMoney8';
// import Messages from '../Modules/Messages';

class Money8List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      matches: [],
      ladder: '',
      games: [],
      is_loaded: false
    };
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  initCancel(match) {
    this.props.dispatch(
      leave_match(
        {
          match_id: match.id
        },
        this.props.user
      )
    );
  }

  componentDidMount() {
    fetch('/api/money8/upcoming')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              matches: json.items
            },
            () => {
              // this.fetchTeams();
            }
          );
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
                <div className="all_t_heading" style={{fontSize: 28}}>
                  Upcoming Mix & Match Matches
                </div>
                <div className="t_big_heading">Play. Win. Collect.</div>
                <div className="banner_actions">
                  <Link
                    to={'/mix-and-match/new/'}
                    className="btn btn-default bttn_submit max-width-300"
                  >
                    Create a mix-and-match pool
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
                <div className="content">
                  <div id="tab1_content" className="content_boxes selected">
                    {this.state.is_loaded && this.state.matches.length < 1 ? (
                      <div className="alert alert-warning">
                        There are no active mix-and-match matches. Please check
                        back later or start a new match
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
                      {this.state.matches.map((match, id) => {
                        return (
                          <SingleMoney8
                            initCancel={this.initCancel.bind(this)}
                            match={match}
                            key={match.id}
                            user={this.props.user}
                          />
                        );
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
export default connect(mapStateToProps)(Money8List);
