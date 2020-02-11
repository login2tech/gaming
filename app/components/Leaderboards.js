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
                <li className={this.state.showing == 'earning' ? 'active' : ''}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();

                      this.setState({
                        showing: 'earnings'
                      });
                    }}
                  >
                    Earning
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
                          <th>&nbsp;</th>
                          <th data-breakpoints={showing == 'xp' ? '' : 'xs sm'}>
                            {showing == 'xp' ? (
                              <span className="text-blue fa fa-arrow-down m-r-10" />
                            ) : (
                              false
                            )}
                            XP Earned
                          </th>
                          <th
                            data-breakpoints={
                              showing == 'earnings' ? '' : 'xs sm'
                            }
                          >
                            {showing == 'earnings' ? (
                              <span className=" text-blue  fa fa-arrow-down m-r-10" />
                            ) : (
                              false
                            )}
                            Earning
                          </th>
                          <th>Career Record</th>
                          <th className="d-none d-md-table-cell">Win Rate</th>
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
                            <tr key={k.id}>
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
                              <td>
                                <img
                                  className="img-fluid mw-100p mw-50p-mob"
                                  src={
                                    '/assets/rank/' +
                                    this.image_based_on_i(k.life_xp) +
                                    '.png'
                                  }
                                />
                              </td>
                              <td>{k.life_xp}</td>
                              <td>${k.life_earning}</td>
                              <td>
                                <span className="text-success">
                                  {k.wins ? k.wins : '0'} W
                                </span>{' '}
                                -{' '}
                                <span className="text-danger">
                                  {k.loss ? k.loss : '0'} L
                                </span>
                              </td>
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
