import React, {useState} from 'react';
import {Link} from 'react-router';
import utils from '../../utils';
const moment = require('moment');

const SingleMoney8 = props => {
  const {match} = props;

  const matchLink = function(orign) {
    if (props.user) {
      return orign;
    }
    return '/login';
  };
  const p_in_t = match.players_total / 2;

  const [showCancelInit, setShowCancelInit] = useState(false);
  let btn_lbl = 'Join Pool';
  let show_cancel = false;
  if (match.players_joined >= match.players_total) {
    // return false;
  } else {
    const me = props.user ? props.user.id : 99999999;
    const users = JSON.parse(match.players);
    for (let i = 0; i < users.length; i++) {
      // console.log(users[i] , me)
      if (users[i] == me) {
        show_cancel = true;
        btn_lbl = 'View Pool';
        break;
      }
    }
  }

  return (
    <div className="col-xs-12 col-sm-12 col-md-6 padding-tournament">
      <div className="tour-box ">
        <div className="tour-details row m-0">
          <div className="tour-cover-block col-3">
            <div className="cover-image">
              <img
                className="logo-image ls-is-cached lazyloaded"
                src={match.game.image_url}
              />
            </div>
          </div>
          <div className="col-9">
            <div className="tour-description-block">
              <div className="name-block">
                <div className="tour-platform">
                  {utils.platform_icon(match.ladder.platform)}
                </div>
                <p className="tour-name" tabIndex="0">
                  {match.game.title}
                  <small>{match.ladder.title}</small>
                </p>
              </div>
              <div className="region-block">
                <div className="region-content">
                  <span className="countdown-timer">
                    <span>Expires </span>{' '}
                    <span>{moment(match.expires_in).fromNow()}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="tour-stats-block">
              <div className="tour-stats flex-3">
                <small>ENTRY PER PLAYER</small>{' '}
                <p>
                  {match.match_type == 'free'
                    ? 'FREE'
                    : match.match_type == 'credits'
                      ? match.match_fee + ' credits'
                      : match.match_type == 'cash'
                        ? '$' + match.match_fee
                        : ' '}
                </p>
              </div>

              <div className="tour-stats">
                <small>MAX PLAYERS</small> <p>{match.players_total}</p>
              </div>
              <div className="tour-stats">
                <small>ENROLLED</small> <p>{match.players_joined}</p>
              </div>
              <div className="tour-stats">
                <small>TEAM SIZE</small>{' '}
                <p>
                  {p_in_t} vs {p_in_t}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="tour-actions">
          {showCancelInit ? (
            false
          ) : (
            <Link to={matchLink('/mix-and-match/' + match.id)}>
              {btn_lbl} <span className="fa fa-arrow-right" />
            </Link>
          )}

          {show_cancel ? (
            showCancelInit ? (
              <>
                <button
                  className="text-danger"
                  onClick={() => {
                    props.initCancel(match);
                  }}
                >
                  SURE?
                </button>
                <button
                  onClick={() => {
                    setShowCancelInit(false);
                  }}
                >
                  x
                </button>
              </>
            ) : (
              <button
                className="text-danger"
                onClick={() => {
                  setShowCancelInit(true);
                }}
              >
                Leave Pool
              </button>
            )
          ) : (
            false
          )}
        </div>
      </div>
    </div>
  );
};
export default SingleMoney8;
