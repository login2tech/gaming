import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

class Leaderboards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      showing: 'xp',
      items_2: [],
      // xp_transactions: [],
      // credit_transactions: [],
      loaded: false
    };
  }

  image_based_on_i(xp) {
    // const xp = this.getXp(xpo);
    if (xp < 50) {
      return 'amateur';
    }
    if (xp < 200) {
      return 'beginner';
    }
    if (xp < 500) {
      return 'upcoming';
    }
    if (xp < 750) {
      return 'advanced';
    }
    if (xp < 1000) {
      return 'bronze';
    }
    if (xp < 1500) {
      return 'silver';
    }
    if (xp < 2000) {
      return 'gold';
    }
    if (xp < 3000) {
      return 'platinum';
    }
    if (xp < 3500) {
      return 'diamond';
    }
    if (xp < 4000) {
      return 'elite';
    }
    return 'elite';
  }

  componentDidMount() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    fetch('/api/leaderboard/xp')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          // console.log('done');
          this.setState(
            {
              items: json.items,
              loaded: true
            },
            this.fetchTransactions_2
          );
        } else {
          this.fetchTransactions_2();
        }
      })
      .catch(function(err) {
        this.fetchTransactions_2();
      });
  }

  fetchTransactions_2() {
    fetch('/api/leaderboard/earning')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          // console.log('done');
          this.setState({
            items_2: json.items,
            loaded: true
          });
        }
      })
      .catch(function(err) {});
  }

  render() {
    const items =
      this.state.showing == 'xp' ? this.state.items : this.state.items_2;
    const {showing} = this.state;
    return (
      <div>
        <section className="page_title_bar noblend has_action_bar">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Leaderboards</h3>
                  <br />
                </div>
              </div>
            </div>
          </div>
          <div className="baris">
            <div className="container">
              <ul className="lnkss">
                <li className={this.state.showing == 'xp' ? 'active' : ''}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();

                      this.setState({
                        showing: 'xp'
                      });
                    }}
                  >
                    XP
                  </a>
                </li>
                <li className={this.state.showing == 'earnings' ? 'active' : ''}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();

                      this.setState({
                        showing: 'earnings'
                      });
                    }}
                  >
                    Earnings
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col">
                <div className="content_box">
                  <div className="table_wrapper">
                    <table className="table table-stripped has_hover">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>User</th>
                          <th className="d-none d-md-table-cell">&nbsp;</th>
                          <th className={showing == 'xp' ? '' : 'd-none d-md-table-cell'}>
                            {showing == 'xp' ? (
                              <span className="text-blue fa fa-arrow-down m-r-10" />
                            ) : (
                              false
                            )}
                            XP Earned
                          </th>
                          <th
                            className={
                              showing == 'earnings' ? '' : 'd-none d-md-table-cell'
                            }
                          >
                            {showing == 'earnings' ? (
                              <span className=" text-blue  fa fa-arrow-down m-r-10" />
                            ) : (
                              false
                            )}
                            Earnings
                          </th>
                          <th className="d-none d-md-table-cell">
                            Career Record
                          </th>
                          <th className="d-none d-md-table-cell">Win Rate</th>
                          <th style={{width: '5%'}} className="d-md-none" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((k, i) => {
                          const image_url =
                            k && k.profile_picture
                              ? k.profile_picture
                              : 'https://ui-avatars.com/api/?size=30&name=' +
                                (k ? k.first_name : '') +
                                '+' +
                                (k ? k.last_name : '') +
                                '&color=124afb&background=fff';

                          return (
                            <React.Fragment key={k.id}>
                              <tr>
                                <td>{i + 1}</td>
                                <td>
                                  <Link
                                    className=" avatar_img_r"
                                    to={k ? '/u/' + k.username : '#'}
                                  >
                                    <img src={image_url} />
                                    {k.username}
                                  </Link>
                                </td>
                                <td className="d-none d-md-table-cell">
                                  <img
                                    className="img-fluid mw-100p mw-50p-mob"
                                    src={
                                      '/assets/rank/' +
                                      this.image_based_on_i(k.life_xp) +
                                      '.png'
                                    }
                                  />
                                </td>
                                <td className={showing == 'xp' ? '' : 'd-none d-md-table-cell'}>{k.life_xp}</td>
                                <td className={
                                  showing == 'earnings' ? '' : 'd-none d-md-table-cell'
                                }>${k.life_earning}</td>
                                <td className="d-none d-md-table-cell">
                                  <span className="text-success">
                                    {k.wins ? k.wins : '0'} W
                                  </span>{' '}
                                  -{' '}
                                  <span className="text-danger">
                                    {k.loss ? k.loss : '0'} L
                                  </span>
                                </td>
                                <td className="d-none d-md-table-cell">
                                  {k.wins + k.loss == 0
                                    ? 100
                                    : (
                                        (k.wins * 100) /
                                        (k.wins + k.loss)
                                      ).toFixed(2)}
                                  %
                                </td>
                                <td className="d-md-none">
                                  <button
                                    className="btn btn-link"
                                    onClick={() => {
                                      this.setState({
                                        expanded:
                                          k.id == this.state.expand_id
                                            ? !this.state.expanded
                                            : true,
                                        expand_id: k.id
                                      });
                                    }}
                                  >
                                    <span
                                      className={
                                        this.state.expanded &&
                                        this.state.expand_id == k.id
                                          ? ' fa fa-minus'
                                          : ' fa fa-plus '
                                      }
                                    />
                                  </button>
                                </td>
                              </tr>
                              {this.state.expanded &&
                              this.state.expand_id == k.id ? (
                                <tr>
                                  <td colSpan="4">
                                    <table className="table">
                                      <tbody>
                                        <tr>
                                          <td
                                            colSpan="2"
                                            className="text-center"
                                          >
                                            <img
                                              className="img-fluid max-width-100"
                                              src={
                                                '/assets/rank/' +
                                                this.image_based_on_i(
                                                  k.life_xp
                                                ) +
                                                '.png'
                                              }
                                            />
                                          </td>
                                        </tr>
                                        <tr>
                                          <td>
                                          {
                                            showing == 'xp' ?
                                             'Earning' : 'Xp Earned'
                                          }
                                          </td>
                                          <td>
                                          {
                                            showing == 'xp' ?
                                             '$'+k.life_earning : k.life_xp
                                          }
                                         </td>
                                        </tr>

                                        <tr>
                                          <td>Career Record</td>
                                          <td>
                                            {' '}
                                            <span className="text-success">
                                              {k.wins ? k.wins : '0'} W
                                            </span>{' '}
                                            -{' '}
                                            <span className="text-danger">
                                              {k.loss ? k.loss : '0'} L
                                            </span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td>Win Rate</td>
                                          <td>
                                            {k.wins + k.loss == 0
                                              ? 100
                                              : (
                                                  (k.wins * 100) /
                                                  (k.wins + k.loss)
                                                ).toFixed(2)}
                                            %
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              ) : (
                                false
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
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

export default connect(mapStateToProps)(Leaderboards);
