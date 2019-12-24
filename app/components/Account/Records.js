import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {openModal, closeModal} from '../../actions/modals';

import PaymentModal from '../Modules/Modals/PaymentModal';

class Records extends React.Component {
  constructor(props) {
    super(props);
    this.state = {records: {}, loaded: false, ladders: {}};
  }

  componentDidMount() {
    this.fetchrecords();
  }

  onGetToken(token) {
    fetch('/api/user/reset/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stripe_token: token == 'USE_OCG' ? 'USE_OCG' : token.id,
        action: 'score_' + this.props.params.duration,
        duration: this.props.params.duration
      })
    }).then(response => {
      this.props.dispatch(
        closeModal({
          id: 'payment'
        })
      );
      if (response.ok) {
        // this.props.refresh();
        this.props.dispatch({type: 'CLR_MSG'});
        this.props.dispatch(
          openModal({
            id: 'trello_snack',
            type: 'snackbar',
            zIndex: 1076,
            content: 'Reseting Score... please wait...'
          })
        );
        setTimeout(() => {
          this.props.dispatch(
            closeModal({
              id: 'trello_snack'
            })
          );
          window.location.reload();
        }, 5000);
      } else {
        this.props.dispatch({
          type: 'GENERIC_FAILURE',
          messages: Array.isArray(response) ? response : [response]
        });
      }
    });
  }

  resetOverall(e) {
    e.preventDefault();
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'payment',
        zIndex: 534,
        heading: 'Reset Records',
        content: (
          <PaymentModal
            msg={
              'You need to pay a small amount to reset ' +
              this.props.params.duration +
              ' records. This will have no impact on your life and season score.'
            }
            amount={5}
            // refresh={props.refresh}
            onGetToken={token => {
              this.onGetToken(token);
            }}
          />
        )
      })
    );
  }

  fetchrecords() {
    fetch(
      '/api/user_info/records?username=' +
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
    // console.log(this.state.ladders);

    const rec = Object.keys(this.state.ladders);
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
                    {this.props.params.duration == 'life' ? 'Life' : ''}
                    {this.props.params.duration == 'season'
                      ? 'Season'
                      : ''}{' '}
                    Records for @{this.props.params.username}
                  </h3>
                  <br />
                  <Link to={'/u/' + this.props.params.username}>
                    <span className="fa fa-arrow-left" /> back to profile
                  </Link>

                  {this.props.user.username == this.props.params.username &&
                  rec.length > 0 &&
                  this.state.loaded ? (
                    <>
                      {' '}
                      |{' '}
                      <a href="#" onClick={this.resetOverall.bind(this)}>
                        <span className="fa fa-repeat" /> reset ($5)
                      </a>
                    </>
                  ) : (
                    false
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                {rec.length == 0 &&
                  this.state.loaded && (
                    <div className="alert alert-warning">
                      No records to show
                    </div>
                  )}

                <div className="user-profile-trophies-wrapper">
                  <div className="user-profile-trophies-container">
                    {rec.map((notif, i) => {
                      return (
                        <div
                          className="single-trophy-container dib m-b-20"
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
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Records);
