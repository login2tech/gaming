import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

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

    const {ladders, records} = this.state;
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
                {this.state.loaded &&
                  this.state.items.length == 0 && (
                    <div className="alert alert-warning">
                      No trophies to show
                    </div>
                  )}

                <div className="user-profile-trophies-wrapper">
                  <div className="user-profile-trophies-container">
                    {this.state.items.map((item, i) => {
                      return (
                        <div
                          className="single-trophy-container m-b-20"
                          key={item}
                          style={{width: 'calc(50% - 10px)'}}
                        >
                          <div className="trophy-image">
                            <img
                              src={
                                '/assets/icons/' +
                                this.props.params.type +
                                '.png'
                              }
                            />
                          </div>
                          <div className="trophy-info">
                            <div className="trophy-name gold" />
                            <div className="trophy-count">
                              <span className="text-success">W</span> -{' '}
                              <span className="text-danger" />
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
