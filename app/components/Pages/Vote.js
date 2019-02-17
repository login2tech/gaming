import React from 'react';
import {connect} from 'react-redux';
import {Translate} from 'react-localize-redux';
import Messages from '../Modules/Messages';

class Vote extends React.Component {
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
    this.fetchRandom();
  }

  fetchRandom() {
    fetch(
      '/api/submission/random/?allow_mature=' +
        (this.state.allow_mature ? 1 : 0)
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            item: json.item && json.item.id ? json.item : false,
            loaded: true,
            current_selection: false
          });
        } else {
          this.setState({
            item: false,
            loaded: true
          });
        }
      });
  }
  doVoteReport() {
    fetch('/api/submission/report', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.props.token}`
      },
      body: JSON.stringify({
        item_id: this.state.item.id
      })
    })
      .then(response => {
        this.fetchRandom();
      })
      .catch(function() {
        this.fetchRandom();
      });
  }

  doVote() {
    if (
      !this.state.item ||
      !this.state.item.id ||
      !this.state.current_selection
    ) {
      return;
    }
    fetch('/api/votes/new', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.props.token}`
      },
      body: JSON.stringify({
        vote: this.state.current_selection,
        item_id: this.state.item.id
      })
    })
      .then(response => {
        if (response.ok) {
          return response.json().then(json => {
            if (json.ok) {
              this.setState(
                {
                  current_selection: false,
                  item: {}
                },
                this.fetchRandom
              );
              this.props.dispatch({
                type: 'CLEAR_MESSAGES'
              });
            } else {
              this.props.dispatch({
                type: 'FAILURE',
                messages: {msg: 'Failed to vote, try again later'}
              });
            }
          });
        } else {
          this.props.dispatch({
            type: 'FAILURE',
            messages: [{msg: 'Failed to vote, try again later'}]
          });
        }
      })
      .catch(function() {
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: 'Failed to vote, try again later'}]
        });
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
            <div className="form-group col-md-12 col-sm-12 co-xs-12">
              <label className="switch">
                <input
                  type="checkbox"
                  required
                  checked={this.state.allow_mature}
                  onChange={() => {
                    this.setState(
                      {
                        allow_mature: !this.state.allow_mature
                      },
                      () => {
                        this.fetchRandom();
                      }
                    );
                  }}
                  name="allow_mature"
                />
                <span className="slider_switch round" />
              </label>
              <Translate id="vote_allow_mature_content" />
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
              {this.state.item &&
                this.state.item.id && (
                  <div className="card m-b-20">
                    <div className="card-header">Submission Profile</div>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">
                        <strong>
                          <Translate id="order_gender_label" />
                        </strong>
                        <span>{this.state.item.gender}</span>
                      </li>
                      <li className="list-group-item">
                        <strong>
                          <Translate id="order_age_label" />
                        </strong>
                        <span>{this.state.item.age_group}</span>
                      </li>
                      <li className="list-group-item">
                        <strong>
                          <Translate id="order_part_of_body_label" />
                        </strong>
                        <span>{this.state.item.part_of_body}</span>
                      </li>
                      <li className="list-group-item">
                        <strong>
                          <Translate id="order_description_label" />
                        </strong>
                        <span>{this.state.item.description}</span>
                      </li>
                    </ul>
                  </div>
                )}

              {this.state.item &&
                this.state.item.id && (
                  <div className="card m-b-20">
                    <div className="card-body">
                      <p>
                        <strong>
                          <Translate id="vote_make_ur_selection" />
                        </strong>
                      </p>
                    </div>
                    <div className="card-footer">
                      <div className="btn-group is_vote  m-b-20">
                        <button
                          data-action="yay"
                          onClick={() =>
                            this.setState({current_selection: 'yes'})
                          }
                          className={
                            'btn ' +
                            (this.state.current_selection == 'yes'
                              ? 'btn-success'
                              : ' btn-outline-success')
                          }
                        >
                          <i className="fa fa-check" />{' '}
                          <Translate id="vote_yes" />
                        </button>
                        <span className="or">
                          <Translate id="vote_or" />
                        </span>
                        <button
                          data-action="nay"
                          onClick={() =>
                            this.setState({current_selection: 'no'})
                          }
                          className={
                            'btn ' +
                            (this.state.current_selection == 'no'
                              ? 'btn-danger'
                              : ' btn-outline-danger')
                          }
                        >
                          <i className="fa fa-times" />{' '}
                          <Translate id="vote_no" />
                        </button>
                      </div>
                      <div className="is_vote_inner m-b-10">
                        <button
                          data-action="nxt"
                          className="btn btn-primary"
                          onClick={this.doVote.bind(this)}
                          disabled={this.state.current_selection === false}
                        >
                          <i className="fa fa-right-arrow" />{' '}
                          <Translate id="vote_submit_next" />
                          suivante
                        </button>
                        <br />
                        <div>OR</div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={this.doVoteReport.bind(this)}
                        >
                          <i className="fa fa-report" />
                          <Translate id="report_this" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              <div className="form-group col-md-12 col-sm-12 co-xs-12">
                <label className="switch">
                  <input
                    type="checkbox"
                    required
                    checked={this.state.allow_mature}
                    onChange={() => {
                      this.setState(
                        {
                          allow_mature: !this.state.allow_mature
                        },
                        () => {
                          this.fetchRandom();
                        }
                      );
                    }}
                    name="allow_mature"
                  />
                  <span className="slider_switch round" />
                </label>
                <Translate id="vote_allow_mature_content" />
              </div>

              <hr />
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
                  <Translate id="vote_title" />
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

export default connect(mapStateToProps)(Vote);
