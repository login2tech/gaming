import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {openModal, closeModal} from '../../actions/modals';
import utils from '../../utils';
import PaymentModal from '../Modules/Modals/PaymentModal';
const seasonName = {
  1: 'Spring',

  2: 'Summer',

  3: 'Fall',

  4: 'Winter'
};
class Records extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      records: {},
      loaded: false,
      xp_data: [],
      ladders: {},
      year_data: {},
      image_to_show:
        this.props.params.duration == 'life'
          ? 'trophy_career.png'
          : 'trophy_seasonal.png'
    };
  }

  componentDidMount() {
    this.fetchrecords();
    this.cur_season = utils.get_current_season();
  }

  onGetToken(token, ladder_data) {
    fetch('/api/user/reset/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stripe_token:
          token == 'USE_OCG' || token == 'USE_PAYPAL' ? token : token.id,
        action: 'score_' + this.props.params.duration,
        amount: ladder_data && ladder_data.only_for_ladder ? 1.99 : 5,
        duration: this.props.params.duration,
        only_for_ladder:
          ladder_data && ladder_data.only_for_ladder
            ? ladder_data.ladder_id
            : false
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
  resetIndividualScore(ladder_id, ladder_title) {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'payment',
        zIndex: 534,
        heading: 'Reset Records - ' + ladder_title,
        content: (
          <PaymentModal
            msg={
              'You need to pay a small amount to reset ' +
              this.props.params.duration +
              ' records for ladder ' +
              ladder_title
            }
            amount={1.99}
            returnDataToEvent={{
              ladder_id: ladder_id,
              only_for_ladder: true
            }}
            onGetToken={(token, return_data) => {
              this.onGetToken(token, return_data);
            }}
          />
        )
      })
    );
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
              ' records.'
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
  fetchXPRanks() {
    fetch(
      '/api/user_info/xp?username=' +
        this.props.params.username +
        '&duration=' +
        'life'
      // this.props.params.duration
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({xp_data: json.items ? json.items : []});
        }
      });
  }
  fetchrecords() {
    fetch(
      '/api/user_info/records?username=' +
        this.props.params.username +
        '&duration=' +
        'life'
      // this.props.params.duration
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const items = json.records;
          const ladders = this.state.ladders;
          const details = this.state.records;
          if (this.props.params.duration == 'life') {
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
          } else {
            this.fetchXPRanks();
            const year_data = {};
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (!year_data[item.year]) {
                year_data[item.year] = {};
              }
              if (!year_data[item.year][item.season]) {
                year_data[item.year][item.season] = {};
              }
              const ladder_id = items[i].ladder_id;
              ladders['l_' + ladder_id] = items[i].ladder;
              if (!year_data[item.year][item.season]['l_' + ladder_id]) {
                year_data[item.year][item.season]['l_' + ladder_id] = {
                  wins: 0,
                  loss: 0
                };
              }
              year_data[item.year][item.season]['l_' + ladder_id].wins +=
                items[i].wins;
              year_data[item.year][item.season]['l_' + ladder_id].loss +=
                items[i].loss;
            }
            this.setState({
              // records: details,
              year_data: year_data,
              records:
                year_data[this.cur_season[0]] &&
                year_data[this.cur_season[0]][this.cur_season[1]]
                  ? year_data[this.cur_season[0]][this.cur_season[1]]
                  : {},
              ladders: ladders,
              loaded: true
            });
            // console.log(year_data[cur_season[0]][cur_season[1]]);
            // console.log(year_data);
          }
        }
      });
  }
  renderSeasonImage(y, s) {
    const f = this.state.xp_data.filter(function(i) {
      return (
        parseInt(i.year) == parseInt(y) && parseInt(i.season) == parseInt(s)
      );
    });
    let xp;
    if (!f || !f.length) {
      xp = 0;
    } else {
      xp = f[0].xp;
    }

    return (
      <img
        className="  img-fluid "
        style={{maxHeight: 100}}
        src={'/assets/rank/' + utils.getMeterImage(xp) + '.png'}
      />
    );
  }
  renderData(rec, records, allowReset) {
    const {ladders} = this.state;
    return (
      <>
        {rec.map((notif, i) => {
          if (!ladders[notif] || !records[notif]) {
            return false;
          }
          return (
            <div
              className="single-trophy-container col-12 col-md-6 col-lg-4 recordentr"
              key={notif}
            >
              <div className="trof_a link_alt">
                <div className="trophy-image">
                  <img src={'/images/' + this.state.image_to_show} />
                </div>
                <div className="trophy-info">
                  <div className="trophy-name gold">
                    {ladders[notif].game_info.title} - {ladders[notif].title}
                    {this.props.user &&
                    allowReset &&
                    this.props.user.username == this.props.params.username &&
                    (records[notif].wins > 0 || records[notif].loss > 0) ? (
                      <a
                        style={{float: 'right'}}
                        className="reset_rep"
                        href="#"
                        onClick={() => {
                          this.resetIndividualScore(
                            ladders[notif].id,
                            ladders[notif].game_info.title +
                              ' - ' +
                              ladders[notif].title
                          );
                        }}
                      >
                        <span className="fa fa-repeat" /> reset ($1.99)
                      </a>
                    ) : (
                      false
                    )}
                  </div>
                  <div className="trophy-count">
                    <span className="text-success">{records[notif].wins}W</span>{' '}
                    -{' '}
                    <span className="text-danger">{records[notif].loss}L</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  }
  renderSeason(y, s) {
    if (
      parseInt(this.cur_season[0]) == parseInt(y) &&
      parseInt(this.cur_season[1]) == parseInt(s)
    ) {
      return false;
    }
    const rec = Object.keys(this.state.ladders);
    return (
      <div className="col-md-12 blue-border-top">
        <div className="row m-b-5 mb-5">
          <div className="col text-center m-b-5 mb-5">
            <h3>
              {seasonName[parseInt(s)]} {y}
            </h3>
          </div>
          <div className="col  text-center">{this.renderSeasonImage(y, s)}</div>
        </div>
        <div className="row  m-t-5 mt-5">
          {this.renderData(rec, this.state.year_data[y][s])}
        </div>
      </div>
    );
  }

  renderYear(k) {
    const seasons = Object.keys(this.state.year_data[k]);
    seasons.sort();
    seasons.reverse();
    return seasons.map((m, i) => {
      return this.renderSeason(k, m);
    });
  }

  renderHistory() {
    if (this.props.params.duration == 'life') {
      return;
    }
    const years = Object.keys(this.state.year_data);
    years.sort();
    years.reverse();
    return years.map((k, i) => {
      return this.renderYear(k);
    });
  }

  render() {
    // console.log(this.state.ladders);

    const rec = Object.keys(this.state.ladders);
    // console.log(rec);

    // console.log(records);
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-8 col-sm-8 col-8">
                <div className="section-headline white-headline text-left">
                  <div className="all_t_heading">
                    {this.props.params.duration == 'life' ? 'Career ' : ''}
                    {this.props.params.duration == 'season' ? 'Season ' : ''}
                    Records
                  </div>
                  <div className="t_big_heading">
                    @{this.props.params.username}
                  </div>

                  <div className="banner_actions justify-left">
                    <Link
                      to={'/u/' + this.props.params.username}
                      className="pt-3 pb-3 dib"
                    >
                      <span className="fa fa-arrow-left" /> back to profile
                    </Link>

                    {this.props.user &&
                    this.props.params &&
                    this.props.user.username == this.props.params.username &&
                    rec.length > 0 &&
                    this.state.loaded ? (
                      <>
                        <span className="d-md-none h-spacer"> | </span>
                        <a
                          href="#"
                          className="pt-3 pb-3 dib  text-lg"
                          onClick={this.resetOverall.bind(this)}
                        >
                          <span className="fa fa-repeat" /> Reset All ($5)
                        </a>
                      </>
                    ) : (
                      false
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-4 col-4 text-center  pt-4 pt-md-0">
                <img
                  className=" mt-3 mt-md-0"
                  src={'/images/' + this.state.image_to_show}
                  style={{maxHeight: 200}}
                />
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
                  <div className="user-profile-trophies-container row">
                    {this.renderData(rec, this.state.records, true)}
                  </div>
                  <div className="user-profile-trophies-container row">
                    {this.renderHistory()}
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
