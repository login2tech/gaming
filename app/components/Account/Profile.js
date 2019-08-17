import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {add_friend} from '../../actions/social';
// import axios from 'axios';
// import Timeline from '../Social/Timeline';
import {openModal} from '../../actions/modals';
import Followers from '../Modules/Modals/Followers';
import Following from '../Modules/Modals/Following';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: {
        first_name: ' ',
        last_name: ' ',
        followers: [],
        teams: [],
        xp_obj: [],
        score: []
      },
      user_teams: [],
      is_loaded: false,
      renderTab: 'profile',
      match_played: [],
      tournaments: [],
      new_post_type: 'text',
      new_post_image: '',
      new_post_video: '',
      posts_page: 1
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.params.username != prevState.username) {
      return {username: nextProps.params.username};
    }
    return null;
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.username != this.state.username) {
      this.fetchUserInfo(true);
    }
    //
  }

  showFollowers(id) {
    this.props.dispatch(
      openModal({
        id: 'followers',
        type: 'custom',
        zIndex: 1075,
        heading: 'Followers',
        content: <Followers uid={id} />
      })
    );
  }

  showFollowing(id) {
    this.props.dispatch(
      openModal({
        id: 'following',
        type: 'custom',
        zIndex: 1076,
        heading: 'Followings',
        content: <Following uid={id} />
      })
    );
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  rank_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return 'Amatuer (' + xp + ' XP)';
    }
    if (xp < 200) {
      return 'Beginner (' + xp + ' XP)';
    }
    if (xp < 500) {
      return 'Upcoming (' + xp + ' XP)';
    }
    if (xp < 1000) {
      return 'Bronze (' + xp + ' XP)';
    }
    if (xp < 1500) {
      return 'Silver (' + xp + ' XP)';
    }
    if (xp < 2000) {
      return 'Gold (' + xp + ' XP)';
    }
    if (xp < 3000) {
      return 'Platinum (' + xp + ' XP)';
    }
    if (xp < 3500) {
      return 'Diamond (' + xp + ' XP)';
    }
    if (xp < 4000) {
      return 'Elite (' + xp + ' XP)';
    }
    if (xp < 0) {
    }
    // if (xp >  5000) {
    return 'Elite (' + xp + ' XP)';
    // }
  }

  rank_min_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return '0';
    }
    if (xp < 200) {
      return '50';
    }
    if (xp < 500) {
      return '200';
    }
    if (xp < 1000) {
      return '500';
    }
    if (xp < 1500) {
      return '1000';
    }
    if (xp < 2000) {
      return '1500';
    }
    if (xp < 3000) {
      return '2000';
    }
    if (xp < 3500) {
      return '3000';
    }
    if (xp < 4000) {
      return '3500';
    }
    if (xp < 0) {
      return 0;
    }
    // if (xp >  5000) {
    return '4000';
    // }
  }

  rank_max_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return '50';
    }
    if (xp < 200) {
      return '200';
    }
    if (xp < 500) {
      return '500';
    }
    if (xp < 1000) {
      return '1000';
    }
    if (xp < 1500) {
      return '1500';
    }
    if (xp < 2000) {
      return '2000';
    }
    if (xp < 3000) {
      return '3000';
    }
    if (xp < 3500) {
      return '3500';
    }
    if (xp < 4000) {
      return '4000';
    }
    // if (xp >  5000) {
    return '5000';
    // }
  }

  rank_percent_based_on_xp(xpo) {
    const year = moment().format('YYYY');
    const season = moment().format('Q');
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (xpo[i].year == year && season == xpo[i].season) {
        xp = xpo[i].xp;
      }
    }
    if (xp < 50) {
      return (xp * 10) / 5;
    }
    if (xp < 200) {
      return ((xp - 50) / 150) * 100;
    }
    if (xp < 500) {
      return ((xp - 50) / 300) * 100;
    }
    if (xp < 1000) {
      return ((xp - 200) / 500) * 100;
    }
    if (xp < 1500) {
      return ((xp - 500) / 500) * 100;
    }
    if (xp < 2000) {
      return ((xp - 1000) / 500) * 100;
    }
    if (xp < 3000) {
      return ((xp - 1500) / 1000) * 100;
    }
    if (xp < 3500) {
      return ((xp - 2000) / 500) * 100;
    }
    if (xp < 4000) {
      return ((xp - 3000) / 500) * 100;
    }
    // if (xp >  5000) {
    return 100;
    // }
  }

  getTeams(match) {
    const team_1_id = match.team_1_id;
    const team_2_id = match.team_2_id;
    const {user_teams} = this.state;

    for (let i = 0; i < user_teams.length; i++) {
      if (team_1_id == user_teams[i].team_info.id) {
        return [match.team_1_info, match.team_2_info, 1];
      }
      if (team_2_id == user_teams[i].team_info.id) {
        return [match.team_2_info, match.team_1_info, 2];
      }
    }
    return [match.team_1_info, match.team_2_info, 1];
  }

  componentDidMount() {
    setTimeout(function() {
      const element = document.getElementById('is_top');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 500);
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
                this.fetchTeams();
              }
            }
          );
        }
      });
  }

  fetchTeams() {
    fetch('/api/teams/team_of_user?uid=' + this.state.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              user_teams: json.teams
            },
            () => {
              this.fetchMatches();
            }
          );
        }
      });
  }

  fetchMatches() {
    let team_array = [];
    for (let i = 0; i < this.state.user_teams.length; i++) {
      const team_parent = this.state.user_teams[i];
      const team = team_parent.team_info ? team_parent.team_info : {};
      team_array.push(team.id);
    }
    team_array = team_array.join(',');

    fetch(
      '/api/matches/matches_of_user?uid=' +
        this.state.user_info.id +
        '&teams=' +
        team_array
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              match_played: json.items
            },
            () => {
              this.fetchTournaments();
            }
          );
        }
      });
  }

  fetchTournaments() {
    // let team_array = [];
    // for (let i = 0; i < this.state.user_teams.length; i++) {
    //   const team_parent = this.state.user_teams[i];
    //   const team = team_parent.team_info ? team_parent.team_info : {};
    //   team_array.push(team.id);
    // }
    // team_array = team_array.join(',');

    fetch('/api/tournaments/t_of_user?uid=' + this.state.user_info.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              tournaments: json.items
            },
            () => {}
          );
        }
      });
  }

  addFriend(event) {
    event.preventDefault();
    this.props.dispatch(
      add_friend(
        {
          follow_to: this.state.user_info.id
        },
        cb => {
          if (!cb) {
            //
          } else {
            //
            setTimeout(() => {
              this.fetchUserInfo(false);
            }, 200);
          }
        }
      )
    );
  }

  tags = [1, 2, 3, 4, 5];
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    // 'Username',
    'Epic Games Username',
    'Steam Username',
    'Battletag'
  ];

  render() {
    const divStyle = this.state.new_cover_pic
      ? {
          backgroundImage: 'url(' + this.state.new_cover_pic + ')'
        }
      : this.state.user_info && this.state.user_info.cover_picture
      ? {
          backgroundImage: 'url(' + this.state.user_info.cover_picture + ')'
        }
      : {};
    return (
      <div>
        <section
          className="page_title_bar less_padding"
          id="is_top"
          style={divStyle}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12">
                <div className="game_pic_tournament profile_pic_outline square">
                  <div className="content">
                    {this.state.user_info &&
                    this.state.user_info.profile_picture ? (
                      <img
                        src={this.state.user_info.profile_picture}
                        className={
                          'img-fluid ' +
                          (this.state.user_info.prime ? ' prime ' : ' ')
                        }
                      />
                    ) : (
                      <img
                        className={
                          'img-fluid ' +
                          (this.state.user_info.prime ? ' prime ' : ' ')
                        }
                        src={
                          'https://ui-avatars.com/api/?size=512&name=' +
                          this.state.user_info.first_name +
                          ' ' +
                          this.state.user_info.last_name +
                          '&color=223cf3&background=000000'
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-9 col-sm-9 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3 className="no-case-change">
                    @{this.state.user_info && this.state.user_info.username}
                  </h3>

                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-3">
                        <span> MEMBER SINCE</span>
                        <p>
                          {moment(this.state.user_info.created_at).format(
                            'lll'
                          )}
                        </p>
                      </div>

                      <div className="col-md-3">
                        <span> TIME ZONE </span>
                        <p>
                          {this.state.user_info.timezone
                            ? this.state.user_info.timezone
                            : '-'}
                        </p>
                      </div>

                      <div className="col-md-3">
                        <span>
                          <a
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              this.showFollowing(this.state.user_info.id);
                            }}
                          >
                            Following
                          </a>
                        </span>
                        <p>
                          <a
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              this.showFollowing(this.state.user_info.id);
                            }}
                          >
                            {this.state.user_info.followingCount}
                          </a>
                        </p>
                      </div>

                      <div className="col-md-3">
                        <span>
                          <a
                            onClick={() => {
                              this.showFollowers(this.state.user_info.id);
                            }}
                          >
                            Followers
                          </a>
                        </span>
                        <p>
                          <a
                            onClick={() => {
                              this.showFollowers(this.state.user_info.id);
                            }}
                          >
                            {this.state.user_info.followerCount}
                          </a>
                        </p>
                      </div>
                      {/*}
                      <div className="col-md-4">
                        <span>LIFETIME EARNINGS</span>
                        <p>12/30/18 2:00PM</p>
                      </div>*/}
                    </div>

                    <div className="row">
                      {/*}<div className="col-md-4">
                        <span>
                          <i className="fa fa-bar-chart" aria-hidden="true" />
                          40,222nd
                        </span>
                        <p>OCG Rank </p>
                      </div>*/}

                      {/*<div className="col-md-4">
                        <span>
                          <i className="fa fa-eye" aria-hidden="true" /> 739
                        </span>
                        <p>Profile Views </p>
                      </div>*/}
                    </div>
                  </div>
                  {this.state.is_loaded ? (
                    <div className="float-right rank_box_wrap">
                      rank :{' '}
                      {this.rank_based_on_xp(this.state.user_info.xp_obj)}
                      <div className="rank_box_prog_outer">
                        <div className="rank_box_prog">
                          <span
                            className="rank_prog_done"
                            style={{
                              width:
                                '' +
                                this.rank_percent_based_on_xp(
                                  this.state.user_info.xp_obj
                                ) +
                                '%'
                            }}
                          />
                        </div>
                        <span>
                          {this.rank_min_based_on_xp(
                            this.state.user_info.xp_obj
                          )}
                        </span>
                        <span>
                          {this.rank_max_based_on_xp(
                            this.state.user_info.xp_obj
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="float-right rank_box_wrap">
                      <span className="fa fa-spinner fa-spin" />
                    </div>
                  )}
                </div>
                {this.props.user &&
                this.state.is_loaded &&
                this.props.user.id != this.state.user_info.id &&
                this.state.user_info.followers.length < 1 ? (
                  <Link
                    onClick={event => {
                      this.addFriend(event);
                    }}
                    className="btn btn-default bttn_submit btn-outline mw_200"
                  >
                    Follow
                  </Link>
                ) : (
                  false
                )}

                {this.props.user &&
                this.state.is_loaded &&
                this.props.user.id != this.state.user_info.id &&
                this.state.user_info.followers.length > 0 ? (
                  <Link
                    onClick={event => {
                      this.addFriend(event);
                    }}
                    className="btn btn-default bttn_submit active mw_200"
                  >
                    Unfollow
                  </Link>
                ) : (
                  false
                )}
              </div>
            </div>
          </div>
          <div className="baris">
            <div className="container">
              <ul className="lnkss">
                <li className={'active'}>
                  <Link
                    onClick={() => {
                      this.setState({
                        renderTab: 'profile'
                      });
                    }}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to={'/u/' + this.props.params.username + '/timeline'}>
                    Timeline
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="contet_part single_match_details">
          <div className="container">
            {this.state.is_loaded ? (
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-trophy" aria-hidden="true" />{' '}
                      ACHIEVEMENT
                    </h5>
                    <br />

                    <div className="user-profile-stats">
                      <div className="user-profile-header-data">
                        <div className="rank-data">
                          <div>RANK</div>{' '}
                          <div>{this.state.user_info.xp_rank}</div>{' '}
                          <div>{this.state.user_info.life_xp} XP</div>
                        </div>
                      </div>
                      <div className="user-profile-header-data">
                        <div className="winnings-data">
                          <div>WINNINGS</div>{' '}
                          <div>
                            $
                            {this.state.user_info.lifetime_earning
                              ? this.state.user_info.lifetime_earning
                              : '0'}
                          </div>
                        </div>
                      </div>
                      <div className="user-profile-header-data">
                        <div className="career-data">
                          <div>CAREER RECORD</div>{' '}
                          <div>
                            <span className="text-success">
                              {this.state.user_info.wins
                                ? this.state.user_info.wins
                                : '0'}{' '}
                              W
                            </span>{' '}
                            -{' '}
                            <span className="text-danger">
                              {this.state.user_info.loss
                                ? this.state.user_info.loss
                                : '0'}{' '}
                              L
                            </span>
                          </div>
                          <div>
                            {this.state.user_info.wins +
                              this.state.user_info.loss ==
                            0
                              ? 100
                              : (this.state.user_info.wins * 100) /
                                (this.state.user_info.wins +
                                  this.state.user_info.loss)}
                            % WIN RATE
                          </div>
                        </div>
                      </div>
                      <div className="user-profile-header-data">
                        <div className="views-data">
                          <div>PROFILE VIEWS</div>{' '}
                          <div>
                            {this.state.user_info.profile_views
                              ? this.state.user_info.profile_views
                              : '0'}
                          </div>{' '}
                          <div />
                        </div>
                      </div>
                    </div>

                    <div className="user-profile-trophies-wrapper">
                      <div className="user-profile-trophies-container">
                        <div className="single-trophy-container">
                          <div className="trophy-image">
                            <img src="/images/shield-gold.png" />
                          </div>
                          <div className="trophy-info">
                            <div className="trophy-name gold">
                              Gold Trophies
                            </div>
                            <div className="trophy-count">0</div>
                          </div>
                        </div>
                        <div className="single-trophy-container">
                          <div className="trophy-image">
                            <img src="/images/shield-silver.png" />
                          </div>
                          <div className="trophy-info">
                            <div className="trophy-name silver">
                              Silver Trophies
                            </div>
                            <div className="trophy-count">0</div>
                          </div>
                        </div>
                        <div className="single-trophy-container">
                          <div className="trophy-image">
                            <img src="/images/shield-bronze.png" />
                          </div>
                          <div className="trophy-info">
                            <div className="trophy-name bronze">
                              Bronze Trophies
                            </div>
                            <div className="trophy-count">0</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="user-profile-trophies-wrapper">
                      <div className="user-profile-trophies-container">
                        <div className="single-trophy-container">
                          <div className="trophy-image">
                            <img src="/images/shield-gold.png" />
                          </div>
                          <div className="trophy-info">
                            <Link
                              to={'/records/'+this.state.user_info.username+'/season'}
                              className="trophy-name gold"
                            >
                              Seasonal Records
                            </Link>
                          </div>
                        </div>

                        <div className="single-trophy-container">
                          <div className="trophy-image">
                            <img src="/images/shield-gold.png" />
                          </div>
                          <div className="trophy-info">
                            <Link
                              to={'/records/'+this.state.user_info.username+'/life'}
                              className="trophy-name gold"
                            >
                              Life Records
                            </Link>
                          </div>
                        </div>

                        {/*this.state.user_info.score.map((xp, i) => {
                        return (
                          <div className="single-trophy-container" key={xp.id}>
                            <div className="trophy-image">
                              <img src="/images/shield-gold.png" />
                            </div>
                            <div className="trophy-info">
                              <div className="trophy-name gold">
                                {xp.ladder.title}
                              </div>
                              <div className="trophy-count">
                                <span className="text-success">{xp.wins}W</span>{' '}
                                -{' '}
                                <span className="text-danger">{xp.loss}L</span>
                              </div>
                            </div>
                          </div>
                        );
                      })*/}
                      </div>
                    </div>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-user" aria-hidden="true" /> ABOUT
                    </h5>

                    <div className="list_pad">
                      <div className="row">
                        <div className="col-md-4">
                          <span> MEMBER SINCE</span>
                          <p>
                            {moment(this.state.user_info.created_at).format(
                              'lll'
                            )}
                          </p>
                        </div>

                        <div className="col-md-4">
                          <span> TIME ZONE </span>
                          <p>
                            {this.state.user_info.timezone
                              ? this.state.user_info.timezone
                              : '-'}
                          </p>
                        </div>

                        <div className="col-md-4">
                          <span>Rank</span>
                          <p>-</p>
                        </div>
                      </div>

                      <div className="row">
                        {this.tags.map((k, i) => {
                          if (
                            !this.state.user_info['gamer_tag_' + k] ||
                            this.state.user_info['gamer_tag_' + k] == ''
                          ) {
                            return false;
                          }
                          return (
                            <div className="col-md-4" key={k}>
                              <span>{this.tag_names[k]}</span>
                              <p>{this.state.user_info['gamer_tag_' + k]}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">
                      <i className="fa fa-users" aria-hidden="true" /> TEAMS
                    </h5>

                    <ul className="team_list">
                      {this.state.user_teams.map((team_parent, i) => {
                        const team = team_parent.team_info
                          ? team_parent.team_info
                          : {};
                        return (
                          <li className="item" key={team.id}>
                            <Link
                              to={
                                '/u/' +
                                this.state.user_info.username +
                                '/teams/' +
                                team.id
                              }
                            >
                              <img src="/images/team_bg.png" />
                              <div className="info">{team.title}</div>
                            </Link>
                          </li>
                        );
                      })}
                      {this.props.user &&
                      this.state.user_info.id == this.props.user.id ? (
                        <li>
                          <a
                            href={
                              '/u/' +
                              this.state.user_info.username +
                              '/teams/new'
                            }
                          >
                            <img src="/images/team_new.png" />
                          </a>
                        </li>
                      ) : (
                        false
                      )}
                    </ul>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">RECORD BY MATCHES</h5>

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Team</th>
                          <th>Opponent</th>
                          <th>Result</th>
                          <th>Date</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.match_played.map((match, i) => {
                          const teams = this.getTeams(match);
                          let is_win = false;
                          let is_loss = false;
                          // is_status = true;
                          if (match.result) {
                            if (match.result == 'team_1') {
                              if (teams[2] == 1) {
                                is_win = true;
                              } else {
                                is_loss = false;
                              }
                            } else if (match.result == 'team_2') {
                              if (teams[2] == 2) {
                                is_win = true;
                              } else {
                                is_loss = false;
                              }
                            } else {
                              // is_status = true;
                            }
                          }
                          {
                            is_win ? (
                              <span className="text-success">W</span>
                            ) : (
                              false
                            );
                          }
                          {
                            is_loss ? (
                              <span className="text-danger">L</span>
                            ) : (
                              false
                            );
                          }
                          {
                            !is_win && !is_loss ? match.status : false;
                          }

                          return (
                            <tr key={match.id}>
                              <td>
                                <Link to={'/m/' + match.id}>#{match.id}</Link>
                              </td>
                              <td>
                                <Link to={'/teams/view/' + teams[0].id}>
                                  {teams[0].title}
                                </Link>
                              </td>
                              <td>
                                {teams[1] ? (
                                  <Link to={'/teams/view/' + teams[0].id}>
                                    {teams[1].title}
                                  </Link>
                                ) : (
                                  ' '
                                )}
                              </td>
                              <td>
                                {match.result ? (
                                  match.result == 'team_1' ? (
                                    teams[2] == 1 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : match.result == 'team_2' ? (
                                    teams[2] == 2 ? (
                                      <span className="text-success">W</span>
                                    ) : (
                                      <span className="text-danger">L</span>
                                    )
                                  ) : (
                                    match.result
                                  )
                                ) : (
                                  match.status
                                )}
                              </td>
                              {/* <td>{''}</td> */}
                              <td>{moment(match.created_at).format('lll')}</td>
                              <td>
                                {' '}
                                <Link to={'/m/' + match.id}>View Match</Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="content_box">
                    <h5 className="prizes_desclaimer">RECENT TOURNAMENTS</h5>

                    <table className="table table-striped table-ongray table-hover">
                      <thead>
                        <tr>
                          <th>Tournament</th>
                          <th>Tournament Placing</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.tournaments.map((match, i) => {
                          return (
                            <tr key={match.id}>
                              <td>{match.id}</td>
                              <td>
                                {match.game.title} - {match.ladder.title}
                              </td>
                              <td>{moment(match.starts_at).format('lll')}</td>
                              <td>{match.status}</td>
                              <td>
                                {' '}
                                <Link to={'/t/' + match.id}>
                                  View Tournament
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <span className="fa fa-spinner fa-spin" />
            )}
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

export default connect(mapStateToProps)(Profile);
