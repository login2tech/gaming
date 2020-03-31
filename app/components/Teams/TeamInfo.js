import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import cookie from 'react-cookie';
import {
  inviteToTeam,
  approveRequest,
  teamPic,
  removeMembers,
  changeTname,
  disband
} from '../../actions/team';
import Messages from '../Modules/Messages';
import axios from 'axios';
import game_user_ids from '../../../config/game_user_ids';
import utils from '../../utils';
class TeamInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      team_info: {ladder: {}, team_users: [], team_type: 'matchfinder'},
      game: {},
      is_loaded: false,
      match_played: [],
      new_invite_user_name: '',
      removing: [],
      is_edit_mode: false
    };
  }

  meInTeam() {
    const me = this.props.user.id;
    if (this.state.team_info.team_users) {
      const tu = this.state.team_info.team_users;
      // console.log(tu)
      for (let i = 0; i < tu.length; i++) {
        if (me == tu[i].user_id) {
          return true;
        }
      }
    }
    return false;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.params.team_id != prevState.team_id) {
      return {team_id: nextProps.params.team_id};
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.team_id != this.state.team_id) {
      this.fetchTeam(true);
    }
    //
  }

  showGamerTag() {
    if (!this.state.team_info || !this.state.team_info.ladder) {
      return '';
    }
    const tg = game_user_ids.tag_names[this.state.team_info.ladder.gamer_tag];
    return (
      <>
      {
        this.state.team_info.ladder.gamer_tag == 6 ?
        <img class="act_in_tbl" src={  '/images/activision.svg'} />:  <span
            className={
              game_user_ids.tag_icons[this.state.team_info.ladder.gamer_tag]
            }
          />
      }

        <span>{tg == 'Activision ID'
          ? 'ID'
          : tg == 'Epic Games Username'
          ? ' Username'
          : tg}</span>
      </>
    );
  }

  approveRequest(event, reject) {
    event.preventDefault();
    this.props.dispatch(
      approveRequest(
        {
          team_id: this.state.team_info.id,
          mode: reject == 'reject' ? 'reject' : 'accept'
        },
        st => {
          if (st) {
            this.fetchTeam();
          }
        }
      )
    );
  }

  invite_user(event) {
    event.preventDefault();
    this.props.dispatch(
      inviteToTeam(
        {
          username: this.state.new_invite_user_name,
          team_id: this.state.team_info.id,
          team_type: this.state.team_info.team_type,
          ladder_id: this.state.team_info.ladder_id
        },
        st => {
          if (st) {
            this.setState(
              {
                new_invite_user_name: ''
              },
              () => {
                this.fetchTeam();
              }
            );
          }
        }
      )
    );
    setTimeout(() => {}, 1000);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  componentDidMount() {
    this.fetchTeam();
  }

  handleChangeTeamName(event) {
    let val = event.target.value ? event.target.value : '';
    // val = val.trim();
    // val = val.toLowerCase();
    // alert();
    val = val.replace(/[^a-zA-Z0-9.-\s]/g, '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp('__', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    val = val.replace(new RegExp(' {2}', 'g'), '_');
    if (
      val[0] == '-' ||
      val[0] == ' ' ||
      val[0] == '_' ||
      val[0] == '1' ||
      val[0] == '2' ||
      val[0] == '3' ||
      val[0] == '4' ||
      val[0] == '5' ||
      val[0] == '6' ||
      val[0] == '7' ||
      val[0] == '8' ||
      val[0] == '9' ||
      val[0] == '0'
    ) {
      val = val.replace(val[0], '');
    }

    this.setState({[event.target.name]: val});
  }

  fetchTeam() {
    fetch('/api/teams/single/' + this.props.params.team_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              team_info: json.item,

              team_id: this.props.params.team_id,
              removing: []
            },
            () => {
              this.fetchGame();
            }
          );
        }
      });
  }

  fetchGame() {
    if (!this.state.team_info.ladder) {
      return;
    }
    fetch('/api/games/single/' + this.state.team_info.ladder.game_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              game: json.item
            },
            () => {
              if (!this.state.team_info) {
                return;
              }
              if (this.state.team_info.team_type == 'matchfinder') {
                this.fetchMatches();
              } else {
                this.fetchTournamentMatches();
              }
            }
          );
        }
      });
  }

  fetchMatches() {
    if (!this.state.team_info.ladder) {
      return;
    }
    fetch(
      '/api/matches/matches_of_team/?exclude_pending=yes&team_id=' +
        this.props.params.team_id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              match_played: json.items ? json.items : []
            },
            () => {
              // this.fetchMatches();
            }
          );
        }
      });
  }

  fetchTournamentMatches() {
    if (!this.state.team_info.ladder) {
      return;
    }
    fetch(
      '/api/tournaments/matches_of_team/?team_id=' + this.props.params.team_id
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              t_match_played: json.items ? json.items : []
            },
            () => {
              // this.fetchMatches();
            }
          );
        }
      });
  }

  handleselectedFile = event => {
    this.setState(
      {
        profile_image_select: event.target.files[0],
        saving_profile_photo: true,
        loaded: 0
      },
      () => {
        this.askFile('profile_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_profile_pic: data.file,
              saving_profile_photo: false,
              new_profile_pic_saved: false
            });
          }
        });
      }
    );
  };

  handleCoverFile = event => {
    this.setState(
      {
        cover_image_select: event.target.files[0],
        saving_cover_photo: true,
        loaded: 0
      },
      () => {
        this.askFile('cover_image_select', data => {
          if (data && data.file) {
            this.setState({
              new_cover_pic: data.file,
              new_cover_pic_saved: false,
              saving_cover_photo: false
            });
          }
        });
      }
    );
  };

  doSaveProfilePic(event) {
    this.setState({
      saving_profile_photo: true
    });
    if (!this.state.new_profile_pic) {
      return;
    }

    event.preventDefault();
    this.props.dispatch(
      teamPic(
        {
          profile_picture: this.state.new_profile_pic
        },
        this.state.team_info.id,
        st => {
          const obj = {saving_profile_photo: false};
          if (st) {
            // obj.new_profile_pic = '';
            obj.new_profile_pic_saved = true;
          }
          this.setState(obj);
        }
      )
    );
  }

  changeUname(event, cb) {
    if (this.state.saving_new_name) {
      return false;
    }
    this.setState({
      saving_new_name: true
    });
    event.preventDefault();
    this.props.dispatch(
      changeTname(
        {
          new_team_name: this.state.new_team_name,
          team_id: this.state.team_info.id
          // change_username_token: this.state.change_username_token
        },
        rep => {
          if (!rep) {
            const team = this.state.team_info;
            team.title = this.state.new_team_name;
            this.setState({
              changing_tname: false,
              team_info: team,
              new_team_name: '',
              saving_new_name: false
            });
          }
        }
      )
    );
  }

  doSaveCoverPic(event) {
    if (!this.state.new_cover_pic) {
      return;
    }
    this.setState({
      saving_cover_photo: true
    });

    event.preventDefault();

    this.props.dispatch(
      teamPic(
        {
          cover_picture: this.state.new_cover_pic
        },
        this.state.team_info.id,

        st => {
          const obj = {saving_cover_photo: false};
          if (st) {
            // obj.new_cover_pic = '';
            obj.new_cover_pic_saved = true;
          }
          this.setState(obj);
        }
      )
    );
  }

  askFile(cls, cb) {
    if (!this.state[cls]) {
      return;
    }
    const data = new FormData();
    data.append('file', this.state[cls], this.state[cls].name);
    axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          });
        }
      })
      .then(res => {
        // console.log(res.data);

        cb && cb(res.data);
      })
      .catch(err => {
        alert('some error occoured.');
        // console.log(err);
      });
  }

  currentUserInTeam() {
    return this.state.team_info.team_creator == this.props.user.id
      ? true
      : false;
  }

  availMembers(membrs) {
    let l = 0;

    for (let i = 0; i < this.state.team_info.team_users.length; i++) {
      //membrs

      if (this.state.team_info.team_users[i].removed == 1) {
        //
      } else {
        l++;
      }
    }
    return l;
  }

  removeUsers() {
    if (!confirm('Are you sure you want to perform this action?')) {
      return;
    }
    // event.preventDefault();
    this.props.dispatch(
      removeMembers(
        {
          team_id: this.state.team_info.id,
          members: this.state.removing
        },
        st => {
          if (st) {
            this.fetchTeam();
            window.location.reload();
          }
        }
      )
    );
  }
  disband() {
    if (!confirm('Are you sure you want to perform this action?')) {
      return;
    }
    this.props.dispatch(
      disband(
        {
          team_id: this.state.team_info.id
          // members: this.state.removing
        },
        st => {
          if (st) {
            this.fetchTeam();
            alert(
              'Team has been disbanded. All matches for team have been automatically processed. Members in roster have been automatically removed from the team.'
            );
            window.location.reload();
          }
        }
      )
    );
  }

  renderStatus(result, t_1, t_2, status) {
    const my_team = this.state.team_info.id;
    let winner = false;
    if (result == 'team_1') {
      winner = parseInt(t_1);
    } else if (result == 'team_2') {
      winner = parseInt(t_2);
    }
    if (!winner) {
      return status;
    }
    if (winner == my_team) {
      return <span className="text-success">W</span>;
    }
    return <span className="text-danger">L</span>;
  }

  rank_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return xp + ' season XP';
  }

  getXp(xpo) {
    if (!xpo) {
      xpo = [];
    }
    const season_obj = utils.get_current_season();
    const year = season_obj[0];
    const season = season_obj[1];
    let xp = 0;
    for (let i = xpo.length - 1; i >= 0; i--) {
      if (parseInt(xpo[i].year) == year && season == parseInt(xpo[i].season)) {
        xp = xpo[i].xp;
      }
    }
    return xp;
  }

  rank_min_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterMin(xp);
  }

  rank_max_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterMax(xp);
  }

  rank_percent_based_on_xp(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterPercent(xp);
  }

  image_based_on_i(xpo) {
    const xp = this.getXp(xpo);
    return utils.getMeterImage(xp);
  }

  renderXPMeter(cls) {
    const {team_info} = this.state;
    return (
      <a
        title="<img class='hover_img' src='/images/xp_banner_team.jpg' />"
        data-toggle="tooltip"
        className={'' + cls}
        onClick={e => {
          $(e.target).tooltip('hide');
          e.preventDefault();
        }}
      >
        {this.rank_based_on_xp(team_info.xp_obj)}
        <div
          className="rank_box_prog_outer"
          style={{
            position: 'relative'
          }}
        >
          <div className="rank_box_prog">
            <span
              className="rank_prog_done"
              style={{
                width:
                  '' + this.rank_percent_based_on_xp(team_info.xp_obj) + '%'
              }}
            />
          </div>
          <span>{this.rank_min_based_on_xp(team_info.xp_obj)}</span>
          <span
            style={
              cls == 'mobile'
                ? {
                    // position: 'absolute',
                    background: 'url(/images/blank_ctrl2.png) center no-repeat',
                    marginTop: '5px',
                    backgroundSize: 'contain',
                    padding: '5px 20px 9px 20px',
                    marginLeft:
                      'calc(' +
                      +this.rank_percent_based_on_xp(team_info.xp_obj) +
                      '% - 29px)'
                  }
                : {
                    position: 'absolute',
                    background: 'url(/images/blank_ctrl2.png) center no-repeat',
                    marginTop: '5px',
                    backgroundSize: 'contain',
                    padding: '5px 20px 9px 20px',
                    left:
                      'calc(' +
                      +this.rank_percent_based_on_xp(team_info.xp_obj) +
                      '% - 29px)'
                  }
            }
          >
            {this.getXp(team_info.xp_obj)}
          </span>
          <span>{this.rank_max_based_on_xp(team_info.xp_obj)}</span>
        </div>
      </a>
    );
  }

  renderWinLoss(mt) {
    const team = this.state.team_info;
    let wins = 0;
    let loss = 0;
    // console.log(team.score);
    let score = team.score;
    if (!score) {
      score = [];
    }
    for (let i = 0; i < score.length; i++) {
      wins += score[i].wins;
      loss += score[i].loss;
    }
    const styl = {
      fontSize: 30,
      marginTop: mt ? mt : 0,
      fontWeight: 'bold'
    };

    return team.score ? (
      <div style={styl}>
        <span className="text-success">{wins} W</span> -{' '}
        <span className="text-danger">{loss} L</span>
      </div>
    ) : (
      <div style={styl}>
        <span className="text-success">0 W</span> -{' '}
        <span className="text-danger">0 L</span>
      </div>
    );
  }

  renderProfileImage() {
    return (
      <>
        {this.props.user &&
        this.currentUserInTeam() &&
        !this.state.team_info.removed ? (
          <div className="update_btn">
            <label htmlFor="profile_image_select" className=" expand_on_hover">
              <i className="fa fa-edit" /> <span>edit picture</span>
            </label>

            {this.state.new_profile_pic && !this.state.new_profile_pic_saved ? (
              <button
                onClick={event => {
                  this.doSaveProfilePic(event);
                }}
                type="button"
                className="expand_on_hover"
              >
                <i className="fa fa-save" /> <span>Save</span>
              </button>
            ) : (
              false
            )}

            <input
              type="file"
              name="profile_image_select"
              id="profile_image_select"
              className="hidden hide"
              accept="image/gif, image/jpeg, image/png"
              onChange={this.handleselectedFile}
            />
          </div>
        ) : (
          false
        )}
        {this.state.saving_profile_photo ? (
          <div className="photo_progress">
            <span className="fa fa-spinner fa-spin" />
          </div>
        ) : (
          false
        )}
        <div className="content">
          {this.state.new_profile_pic ? (
            <img src={this.state.new_profile_pic} className="img-fluid" />
          ) : this.state.team_info.profile_picture ? (
            <img
              src={this.state.team_info.profile_picture}
              className="img-fluid "
            />
          ) : (
            <img className="img-fluid  " src="/images/team_bg.png" />
          )}
        </div>
      </>
    );
  }

  renderNameAndFollow(renderWinL, h2) {
    const a = (
      <>
        <span
          className={
            game_user_ids.tag_icons[this.state.team_info.ladder.gamer_tag]
          }
        />
        {this.state.changing_tname ? (
          <div className="change_uname_wrap">
            <input
              id="new_team_name"
              name="new_team_name"
              maxlen="20"
              maxLength="20"
              max="20"
              autoFocus
              className="form-control change_uname_field"
              onChange={this.handleChangeTeamName.bind(this)}
              value={this.state.new_team_name}
            />
            <button
              className="btn bg-white mr-1 change_tname_r"
              disabled={this.state.new_team_name == this.state.team_info.title}
              onClick={this.changeUname.bind(this)}
            >
              <span
                className={
                  this.state.saving_new_name == true
                    ? 'fa fa-spin fa-spinner'
                    : 'fa fa-save'
                }
              />
            </button>
            <button
              className="text-danger btn  change_tname_r"
              onClick={() => {
                this.setState({
                  changing_tname: false
                });
              }}
            >
              <span className="fa fa-times " />
            </button>
          </div>
        ) : (
          <>
            {this.state.team_info.title}
            {this.state.team_info.removed ? ' - DELETED TEAM ' : ''}
            {this.state.team_info.team_creator == this.props.user.id &&
            !this.state.team_info.removed ? (
              <button
                onClick={event => {
                  $(event.target).tooltip('hide');
                  this.setState({
                    changing_tname: true,
                    new_team_name: this.state.team_info.title
                  });
                }}
                className=" fa fa-edit btn bg-white  change_tname change_tname_r ml-1"
                title={'Edit team name'}
                data-toggle="tooltip"
              />
            ) : (
              false
            )}
          </>
        )}
      </>
    );
    return (
      <>
        <div className="flex-1">{h2 == 'h3' ? <h3>{a}</h3> : <h2>{a}</h2>}</div>
        <div className="flex-1 text-center">
          {renderWinL ? this.renderWinLoss(34) : false}
        </div>
      </>
    );
  }

  render() {
    const divStyle = this.state.new_cover_pic
      ? {
          backgroundImage: "url('" + this.state.new_cover_pic + "')",
          paddingBottom: 30
        }
      : this.state.team_info && this.state.team_info.cover_picture
      ? {
          backgroundImage: 'url(' + this.state.team_info.cover_picture + ')',
          paddingBottom: 30
        }
      : {
          paddingBottom: 30
        };

    return (
      <div>
        <section
          className="page_title_bar less_padding bigger_bg  dsh-profhww  more-m-m-b d-none  d-md-block"
          id="is_top"
          style={divStyle}
        >
          {this.state.saving_cover_photo ? (
            <div className="photo_progress cover_progress">
              <span className="fa fa-spinner fa-spin" />
            </div>
          ) : (
            false
          )}
          {this.props.user &&
          this.currentUserInTeam() &&
          !this.state.team_info.removed ? (
            <div className="update_btn cover">
              <label htmlFor="cover_image_select" className=" expand_on_hover">
                <i className="fa fa-edit" /> <span>upload banner</span>
              </label>

              {this.state.new_cover_pic && !this.state.new_cover_pic_saved ? (
                <button
                  onClick={event => {
                    this.doSaveCoverPic(event);
                  }}
                  type="button"
                  className="expand_on_hover"
                >
                  <i className="fa fa-save" /> <span>save new banner</span>
                </button>
              ) : (
                false
              )}

              <input
                type="file"
                name="cover_image_select"
                id="cover_image_select"
                className="hidden hide"
                accept="image/gif, image/jpeg, image/png"
                onChange={this.handleCoverFile.bind(this)}
              />
            </div>
          ) : (
            false
          )}

          <div className="container profile_container">
            <div className="row">
              <div className=" col-md-3 col-6 col-xs-12 dash-profh-wrap text-center">
                <span className="textcap text-center d-md-block d-none">
                  {this.state.team_info.team_type == 'tournaments' ? (
                    <span className="trofy pt-2">
                      <span className="fa fa-trophy text-lg" />{' '}
                      {this.state.team_info.team_type}
                    </span>
                  ) : (
                    this.state.team_info.team_type
                  )}{' '}
                  team
                </span>
                <div
                  className={
                    'game_pic_tournament profile_pic_outline  ' +
                    (this.state.new_profile_pic ? ' square' : '')
                  }
                >
                  {this.renderProfileImage()}
                </div>
              </div>
              <div className="col-md-5 col-12 p-m-t-20 d-flex flex-column">
                {this.renderNameAndFollow(true)}
              </div>
              {/*}<div className="col-md-2  text-center d-md-block d-none" /> */}
              <div className="col-md-4  col-6 justify-content-end  flex-column d-md-flex">
                <div> </div>
                <div>
                  <div className="row">
                    <div className="col-md-1" />
                    <div className="col-md-11">
                      <a
                        title="<img class='hover_img' src='/images/xp_banner_team.jpg' />"
                        data-toggle="tooltip"
                        className="dib"
                        onClick={e => {
                          e.preventDefault();
                        }}
                      >
                        <img
                          className="  img-fluid"
                          src={
                            '/assets/rank/team_' +
                            this.image_based_on_i(this.state.team_info.xp_obj) +
                            '.png'
                          }
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-12 text-center mt-2">
                <div className="team_actions">
                  {this.props.user &&
                  this.state.team_info.team_creator == this.props.user.id &&
                  !this.state.team_info.removed &&
                  this.state.team_info.team_type == 'matchfinder' ? (
                    <>
                      <Link
                        to={
                          '/matchfinder/new/' +
                          this.state.team_info.ladder.id +
                          '/' +
                          this.state.team_info.id
                        }
                        className="btn btn-default bttn_submit mw_200 mr-1"
                        style={{margin: '0 auto'}}
                      >
                        Create a match
                      </Link>
                      <Link
                        to={'/matchfinder/'}
                        className="btn btn-default bttn_submit mw_200"
                        style={{margin: '0 auto'}}
                      >
                        Find a match
                      </Link>
                    </>
                  ) : (
                    false
                  )}
                  {!this.meInTeam() &&
                  this.state.team_info.team_type == 'matchfinder' ? (
                    <Link
                      to={
                        '/challenge/new/g/' +
                        this.state.team_info.ladder.game_id +
                        '/l/' +
                        this.state.team_info.ladder.id +
                        '/t/' +
                        this.state.team_info.id
                      }
                      onClick={() => {
                        cookie.save(
                          'challenging_team',
                          this.state.team_info.title,
                          {
                            path: '/',
                            expires: moment()
                              .add(1, 'day')
                              .toDate()
                          }
                        );
                      }}
                      className="btn btn-default bttn_submit mw_200"
                      style={{margin: '0 auto'}}
                    >
                      Challenge
                    </Link>
                  ) : (
                    false
                  )}
                  {this.state.team_info &&
                  this.state.team_info.team_type == 'tournaments' ? (
                    <Link
                      to={'/t/' + this.state.team_info.team_t_id}
                      className="btn btn-default mt-2 bttn_submit mw_200"
                      style={{margin: '0 auto'}}
                    >
                      View Tournament
                    </Link>
                  ) : (
                    false
                  )}
                </div>
              </div>

              <div className=" order-md-last col-md-4 d-md-block d-none row  pr-0 ">
                <div className="row">
                  <div className="col-md-1" />

                  <div className="col-md-11 col-9">
                    {this.renderXPMeter('rank_box_wrap float-right ')}
                  </div>
                </div>
              </div>

              <div className="col-md-5">
                <div className="section-headline white-headline text-left">
                  <div className="list_pad">
                    <div className="row">
                      <div className="col-md-4 col-4 lss_size">
                        <span>
                          <i className="fa fa-gamepad" aria-hidden="true" />
                          {this.state.game.title}
                        </span>
                        <p>Game </p>
                      </div>
                      <div className="col-md-4 col-4 lss_size">
                        <span>
                          <i className="fa fa-trophy" aria-hidden="true" />
                          {this.state.team_info.ladder &&
                            this.state.team_info.ladder.title}
                        </span>
                        <p>Ladder </p>
                      </div>
                      <div className="col-md-4 col-4 lss_size">
                        <span>
                          <i className="fa fa-users" aria-hidden="true" />
                          Min:{' '}
                          {this.state.team_info.ladder
                            ? this.state.team_info.ladder.min_players
                            : ''}{' '}
                          | Max:{' '}
                          {this.state.team_info.ladder
                            ? this.state.team_info.ladder.max_players
                            : ''}
                        </span>
                        <p>Players </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          id="profile-page-container"
          className="team_header_mobile profile-page team-profile-page user-profile d-md-none"
        >
          {this.state.saving_cover_photo ? (
            <div className="photo_progress cover_progress">
              <span className="fa fa-spinner fa-spin" />
            </div>
          ) : (
            false
          )}
          {this.props.user &&
          this.currentUserInTeam() &&
          !this.state.team_info.removed ? (
            <div className="update_btn cover">
              <label htmlFor="cover_image_select" className=" expand_on_hover">
                <i className="fa fa-edit" /> <span>upload banner</span>
              </label>

              {this.state.new_cover_pic && !this.state.new_cover_pic_saved ? (
                <button
                  onClick={event => {
                    this.doSaveCoverPic(event);
                  }}
                  type="button"
                  className="expand_on_hover"
                >
                  <i className="fa fa-save" /> <span>save new banner</span>
                </button>
              ) : (
                false
              )}

              <input
                type="file"
                name="cover_image_select"
                id="cover_image_select"
                className="hidden hide"
                accept="image/gif, image/jpeg, image/png"
                onChange={this.handleCoverFile.bind(this)}
              />
            </div>
          ) : (
            false
          )}
          <div className="profile-header" style={divStyle} />
          <div className="container profile-page-container">
            <div className="profile-header-data">
              <div className="profile-header-data-left">
              <span className="textcap d-md-none d-inline-block width-100 pl-2">
                {this.state.team_info.team_type == 'tournaments' ? (
                  <span className="trofy pt-2">
                    <span className="fa fa-trophy text-lg" />{' '}
                    {this.state.team_info.team_type}
                  </span>
                ) : (
                  this.state.team_info.team_type
                )}{' '}
                team
              </span>
                <div className="profile-avatar">
                  {this.renderProfileImage()}
                </div>
              </div>
              <div className="profile-header-data-middle">
                <div>{this.renderNameAndFollow(false, 'h3')}</div>
                <div>{this.renderWinLoss(0)}</div>
              </div>
            </div>
            <div className="row">
              <div className="user-rank-mobile row  rank_box_wrap">
                <div className="col-3">
                  <img
                    src={
                      '/assets/rank/team_' +
                      this.image_based_on_i(this.state.team_info.xp_obj) +
                      '.png'
                    }
                    className="rank-image float-left"
                  />
                </div>
                <div className="col-9  rank-data">
                  {this.renderXPMeter('mobile')}
                </div>
              </div>
              <div className="col-xs-12 profile-page-stats-block-wrapper">
                <div className="profile-page-stats-block" />
              </div>
              <div className="clearfix" />
            </div>
          </div>

          <div className="team_actions mt-4 ml-2 mr-2">
            {this.props.user &&
            this.state.team_info.team_creator == this.props.user.id &&
            !this.state.team_info.removed &&
            this.state.team_info.team_type == 'matchfinder' ? (
              <Link
                to={
                  '/matchfinder/new/' +
                  this.state.team_info.ladder.id +
                  '/' +
                  this.state.team_info.id
                }
                className="btn btn-default bttn_submit mw_200 mr-1"
                style={{margin: '0 auto'}}
              >
                Create a match
              </Link>
            ) : (
              false
            )}
            {this.state.team_info &&
            this.state.team_info.team_type == 'tournaments' ? (
              <Link
                to={'/t/' + this.state.team_info.team_t_id}
                className="btn btn-default mt-2 bttn_submit mw_200"
                style={{margin: '0 auto'}}
              >
                View Tournament
              </Link>
            ) : (
              <Link
                to={'/matchfinder/'}
                className="btn btn-default bttn_submit mw_200"
                style={{margin: '0 auto'}}
              >
                Find a match
              </Link>
            )}
          </div>
        </div>

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="content_box">
                  <h5 className="prizes_desclaimer">
                    <i className="fa fa-users" aria-hidden="true" /> SQUAD
                    <span className="pull-right">
                      {this.props.user &&
                        this.props.user.id ==
                          this.state.team_info.team_creator &&
                        !this.state.team_info.removed && (
                          <button
                            className="is_link btn"
                            onClick={() => {
                              this.setState({
                                is_edit_mode: !this.state.is_edit_mode
                              });
                            }}
                          >
                            <i className="fa fa-edit" /> edit team{' '}
                          </button>
                        )}
                    </span>
                  </h5>

                  <div className="table_wrapper">
                    <table className="table table-striped table-ongray table-hover team_tbl_header">
                      <thead>
                        <tr>
                          {this.state.is_edit_mode && <th>{'remove'}</th>}
                          <th>Username</th>
                          <th>Role</th>
                          <th   className={"d-none d-md-table-cell  act_pr" + this.state.team_info.ladder.gamer_tag}

                          >
                            {this.showGamerTag()}
                          </th>
                          <th>Eligible</th>
                          <th   className="d-none d-md-table-cell">Date Joined</th>
                          <th style={{width: '5%'}} className="d-md-none" />

                        </tr>
                      </thead>
                      <tbody>
                        {this.state.team_info.team_users.map((team_user, i) => {
                          if (team_user.removed == 1) {
                            return false;
                          }
                          // console.log(team_user.user_info.id, this.props.user.id);
                          return (
                              <React.Fragment key={team_user.id}>
                            <tr >

                              {this.state.is_edit_mode && (
                                <td>
                                  {this.props.user &&
                                    team_user.user_info.id !=
                                      this.props.user.id && (
                                      <input
                                        type="checkbox"
                                        checked={
                                          this.state.removing.indexOf(
                                            team_user.user_info.id
                                          ) > -1
                                        }
                                        onChange={() => {
                                          const removing = this.state.removing;
                                          const idx = removing.indexOf(
                                            team_user.user_info.id
                                          );
                                          if (idx > -1) {
                                            removing.splice(idx, 1);
                                          } else {
                                            removing.push(
                                              team_user.user_info.id
                                            );
                                          }
                                          this.setState({
                                            removing: removing
                                          });
                                        }}
                                      />
                                    )}
                                </td>
                              )}
                              <td class={  team_user.user_info.prime
                                  ? ' is_prime_cell is_prime_type_' +
                                    team_user.user_info.prime_type
                                  : ''
                              }}>
                                <Link to={'/u/' + team_user.user_info.username}>
                                  {team_user.user_info.username}
                                </Link>
                              </td>

                              <td>
                                {team_user.user_id ==
                                this.state.team_info.team_creator
                                  ? 'Leader'
                                  : 'Member'}
                              </td>

                              <td className="d-none d-md-table-cell">
                                {this.state.team_info &&
                                this.state.team_info.ladder &&
                                this.state.team_info.ladder.gamer_tag
                                  ? team_user.user_info[
                                      'gamer_tag_' +
                                        this.state.team_info.ladder.gamer_tag
                                    ]
                                  : ''}
                              </td>

                              <td>
                                {this.state.team_info &&
                                this.state.team_info.ladder &&
                                this.state.team_info.ladder.gamer_tag &&
                                team_user.user_info[
                                  'gamer_tag_' +
                                    this.state.team_info.ladder.gamer_tag
                                ] ? (
                                  <span className="text-success">
                                    <img
                                      className="icon_size"
                                      src="/images/controller-green.svg"
                                    />{' '}
                                    Eligible
                                  </span>
                                ) : (
                                  <span className="text-danger">
                                    <img
                                      className="icon_size"
                                      src="/images/controller-red.svg"
                                    />{' '}
                                    Not Eligible
                                  </span>
                                )}
                              </td>
                              <td className="d-none d-md-table-cell">
                                {team_user.accepted
                                  ? moment(team_user.created_at).format('lll')
                                  : 'Not Yet Accepted'}{' '}
                                {this.props.user &&
                                !team_user.accepted &&
                                team_user.user_id == this.props.user.id ? (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={event => {
                                      this.approveRequest(event);
                                    }}
                                  >
                                    Accept
                                  </button>
                                ) : (
                                  false
                                )}
                                {this.props.user &&
                                !team_user.accepted &&
                                team_user.user_id == this.props.user.id ? (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={event => {
                                      this.approveRequest(event, 'reject');
                                    }}
                                  >
                                    Reject
                                  </button>
                                ) : (
                                  false
                                )}
                              </td>
                              <td className="d-md-none">
                                <button
                                  className="btn btn-link"
                                  onClick={() => {
                                    this.setState({
                                      expanded:
                                        team_user.id == this.state.expand_id
                                          ? !this.state.expanded
                                          : true,
                                      expand_id: team_user.id
                                    });
                                  }}
                                >
                                  <span
                                    className={
                                      this.state.expanded &&
                                      this.state.expand_id == team_user.id
                                        ? ' fa fa-minus'
                                        : ' fa fa-plus '
                                    }
                                  />
                                </button>
                              </td>
                            </tr>

                            {this.state.expanded &&
                            this.state.expand_id == team_user.id ? (
                              <tr>
                                <td colSpan="4">
                                  <table className="table expndingtbl">
                                    <tbody>
                                      <tr>
                                        <td>{this.showGamerTag()}</td>
                                        <td>{this.state.team_info &&
                                        this.state.team_info.ladder &&
                                        this.state.team_info.ladder.gamer_tag
                                          ? team_user.user_info[
                                              'gamer_tag_' +
                                                this.state.team_info.ladder.gamer_tag
                                            ]
                                          : ''}</td>
                                      </tr>
                                      <tr>
                                        <td>Date Joined</td>
                                        <td>
                                        {team_user.accepted
                                          ? moment(team_user.created_at).format('lll')
                                          : 'Not Yet Accepted'}{' '}
                                        {this.props.user &&
                                        !team_user.accepted &&
                                        team_user.user_id == this.props.user.id ? (
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={event => {
                                              this.approveRequest(event);
                                            }}
                                          >
                                            Accept
                                          </button>
                                        ) : (
                                          false
                                        )}
                                        {this.props.user &&
                                        !team_user.accepted &&
                                        team_user.user_id == this.props.user.id ? (
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={event => {
                                              this.approveRequest(event, 'reject');
                                            }}
                                          >
                                            Reject
                                          </button>
                                        ) : (
                                          false
                                        )}
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
                  {this.state.is_edit_mode && (
                    <div>
                      {' '}
                      <button
                        disabled={this.state.removing.length < 1}
                        className="btn btn-danger sm"
                        onClick={() => {
                          this.removeUsers();
                        }}
                      >
                        Remove from squad
                      </button>
                      <button
                        className="is_link btn"
                        onClick={() => {
                          this.disband();
                        }}
                      >
                        <span className=" fa fa-times text-danger" /> Disband
                        team
                      </button>
                    </div>
                  )}
                </div>

                {this.props.user &&
                this.state.team_info.team_creator == this.props.user.id &&
                parseInt(this.state.team_info.ladder.max_players) >
                  this.availMembers(this.state.team_info.team_users) &&
                !this.state.team_info.removed ? (
                  <div className="content_box">
                    <h5 className="prizes_desclaimer">Invite A User</h5>
                    <Messages messages={this.props.messages} />
                    <form
                      onSubmit={this.invite_user.bind(this)}
                      className="row margin-40"
                    >
                      <div className="col-md-4">
                        <div className="form-group">
                          <input
                            type="text"
                            id="new_invite_user_name"
                            className="form-control"
                            required=""
                            placeholder="Enter Username"
                            name="new_invite_user_name"
                            value={this.state.new_invite_user_name}
                            onChange={this.handleChange.bind(this)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <button
                          type="submit"
                          disabled={this.state.new_invite_user_name == ''}
                          className="btn btn-sm btn-primary"
                        >
                          Invite User
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  false
                )}
                <div className="content_box">
                  <h5 className="prizes_desclaimer">RECENT MATCHES</h5>

                  <div className="table_wrapper">
                    {this.state.team_info.team_type == 'matchfinder' ? (
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th className="h-o-p  d-none">Match</th>
                            <th>Opponent</th>
                            <th>Status</th>

                            <th>Date</th>
                            <th>Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.match_played.map((match, i) => {
                            return (
                              <tr key={match.id}>
                                <td className="h-o-p  d-none">
                                  <Link to={'/m/' + match.id}>#{match.id}</Link>
                                </td>
                                <td>
                                  {match.team_1_id ==
                                  this.state.team_info.id ? (
                                    <Link to={'/teams/view/' + match.team_2_id}>
                                      {match.team_2_info
                                        ? match.team_2_info.title
                                        : ''}
                                    </Link>
                                  ) : (
                                    <Link to={'/teams/view/' + match.team_1_id}>
                                      {match.team_1_info.title}
                                    </Link>
                                  )}
                                </td>

                                <td>
                                  {match.result
                                    ? this.renderStatus(
                                        match.result,
                                        match.team_1_id,
                                        match.team_2_id,
                                        match.status
                                      )
                                    : match.status}
                                </td>

                                <td>
                                  {moment(match.created_at).format('lll')}
                                </td>
                                <td>
                                  <Link to={'/m/' + match.id}>
                                    View <span className="h-o-p">Match</span>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <table className="table table-striped table-ongray table-hover">
                        <thead>
                          <tr>
                            <th className="h-o-p  d-none">Match</th>
                            <th>Tournament</th>
                            <th>Opponent</th>
                            <th>Status</th>

                            <th>Date</th>
                            <th>Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.match_played.map((match, i) => {
                            return (
                              <tr key={match.id}>
                                <td className="h-o-p  d-none">
                                  <Link to={'/m/' + match.id}>#{match.id}</Link>
                                </td>
                                <td>
                                  <Link to={'/m/' + match.id}>#{match.id}</Link>
                                </td>
                                <td>
                                  {match.team_1_id ==
                                  this.state.team_info.id ? (
                                    <Link to={'/teams/view/' + match.team_2_id}>
                                      {match.team_2_info
                                        ? match.team_2_info.title
                                        : ''}
                                    </Link>
                                  ) : (
                                    <Link to={'/teams/view/' + match.team_1_id}>
                                      {match.team_1_info.title}
                                    </Link>
                                  )}
                                </td>
                                <td>
                                  {match.result
                                    ? this.renderStatus(
                                        match.result,
                                        match.team_1_id,
                                        match.team_2_id,
                                        match.status
                                      )
                                    : match.status}
                                </td>
                                <td>
                                  {moment(match.created_at).format('lll')}
                                </td>
                                <td>
                                  <Link to={'/m/' + match.id}>
                                    View <span className="h-o-p">Match</span>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
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
export default connect(mapStateToProps)(TeamInfo);
