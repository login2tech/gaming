import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');

class Trophies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false, items: []};
  }

  componentDidMount() {
    this.fetchUserInfo(true);
  }
  fetchUserInfo(forward) {
    fetch('/api/user_info?addViews=yes&uid=' + this.props.params.username)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              user_info: json.user_info,
              username: this.props.params.username
            },
            () => {
              if (forward) {
                this.fetchTrophies();
              }
            }
          );
        }
      });
  }

  fetchTrophies() {
    fetch(
      '/api/user_info/trophies/details?type=' +
        this.props.params.type +
        '&uid=' +
        this.state.user_info.id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            items: json.items,
            loaded: true
          });
        }
      });
  }

  render() {
    // console.log(this.state.ladders);

    // const rec = Object.keys(this.state.ladders);
    // console.log(rec);

    // console.log(records);
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3
                  // className="no-case-change"
                  // style={{textTransform: 'capitalize !important'}}
                  >
                    {this.props.params.type} Trophies
                  </h3>
                  <div className="banner_actions">
                    <Link
                      class="pt-3 pb-3 dib"
                      to={'/u/' + this.props.params.username}
                    >
                      <span className="fa fa-arrow-left" /> back to profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                {this.state.loaded &&
                  this.state.items.length == 0 && (
                    <div className="alert alert-warning">
                      No trophies to show
                    </div>
                  )}

                <div className="user-profile-trophies-wrapper">
                  <div className="user-profile-trophies-container row">
                    {this.state.items.map((item, i) => {
                      return (
                        <div
                          key={item.id}
                          className="col-md-3 col-lg-2 mb-5  col-6 single-trophy"
                        >
                          <a
                            className="no_background"
                            href={
                              item.tournament ? '/t/' + item.tournament.id : ''
                            }
                          >
                            <img
                              data-toggle="tooltip"
                              title={
                                item.tournament.title +
                                '<br/>' +
                                moment(item.created_at).fromNow()
                              }
                              className="img-fluid"
                              src={
                                '/assets/icons/' +
                                this.props.params.type +
                                '.png'
                              }
                            />
                          </a>
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
