import React from 'react';
import {connect} from 'react-redux';
import {Translate} from 'react-localize-redux';
import Messages from '../Modules/Messages';

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      item: {},
      current_selection: false,
      allow_mature: false
    };
  }

  componentWillUnmount() {}
  componentDidMount() {
    this.fetchMyListings();
  }

  fetchMyListings() {
    fetch('/api/submission/my')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            items: json.items,
            loaded: true
          });
        } else {
          this.setState({
            item: false,
            loaded: true
          });
        }
      });
  }

  renderSection() {
    if (!this.state.item && this.state.loaded) {
      return (
        <section className="m-b-50">
          <div className="container">
            <div className="alert alert-warning">
              <Translate id="no_more_submissions_to_vote" />
            </div>
          </div>
        </section>
      );
    }
    return (
      <section className="m-b-50">
        <div className="container">
          <Messages messages={this.props.messages} />
          <div className="row">
            <div className="col-md-4">
              <div className="list-group">
                {this.state.items &&
                  this.state.items.map((item, i) => {
                    return (
                      <button
                        className={
                          'list-group-item d-flex justify-content-between align-items-center ' +
                          (this.state.active_id == item.id ? ' active ' : '')
                        }
                        key={item.i}
                      >
                        <img src={item.image_url} style={{width: '50px'}} />
                        <span className="badge badge-primary badge-pill">
                          #{item.id}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
            <div className="col-md-8">
              {this.state.item &&
                this.state.item.image_url && (
                  <div className="piled">
                    <div>
                      {this.state.item &&
                        this.state.item.mature && (
                          <span className="mature_item">
                            <Translate id="vote_is_mature" />
                          </span>
                        )}
                      <img
                        data-field="attachment"
                        className="img-fluid"
                        alt=""
                        src={this.state.item.image_url}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  render() {
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h2 className="title_heading">
                  <Translate id="result_title" />
                </h2>
              </div>
            </div>
          </div>
        </section>
        {this.renderSection()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    token: state.auth.token,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Results);
