import React, {useState} from 'react';
import {Link} from 'react-router';
import utils from '../../utils';
const moment = require('moment');

const SingleMatch = props => {
  const {match} = props;
  const matchLink = function(orign) {
    if (props.user) {
      return orign;
    }
    return '/login';
  };
  const [showCancelInit, setShowCancelInit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  let txt = '';
  // const txt2 = '';
  txt = 'Accept Match';
  let t1p = match.team_1_players;
  if (!t1p) {
    t1p = '';
  }
  let show_cancel = false;
  t1p = t1p.split('|');
  // console.log(t1p);
  if (props.user && t1p.indexOf('' + props.user.id) > -1) {
    txt = 'View Match';
    if (match.status == 'pending') {
      show_cancel = true;
    }
  }
  if (typeof match.game_settings === 'string') {
    match.game_settings = JSON.parse(match.game_settings);
  }

  return (
    <div className="live-wager-block">
      <div className="live-wager-row">
        <div>
          <div className="game-cover-block">
            <span class="game_img_mfndr">
              <img className="game-logo float-left" src={match.game.image_url} />
            </span>{' '}
            {match.game.title} - {match.ladder.title}
            {match.game_settings && match.game_settings.game_mode ? (
              <>
                <br />
                <span className="text-primary">
                  {match.game_settings.game_mode ? match.game_settings.game_mode : match.game_settings.match_type ? match.game_settings.match_type : ''}
                </span>
              </>
            ) : (
              false
            )}
          </div>
        </div>
        <div className="wager-cost">
          <span>
            {match.match_type == 'free'
              ? 'FREE'
              : match.match_type == 'credits' || match.match_type == 'credit'
                ? match.match_fee + ' credits'
                : match.match_type == 'cash'
                  ? '$' + match.match_fee
                  : ' '}{' '}
            {utils.feeIcon(match.match_type)}
          </span>
        </div>
        <div className="wager-team-size d-none d-md-flex">
          {match.match_players}v{match.match_players}
        </div>

        <div className="wager-region d-none d-md-flex">
          {utils.getCountryImage(match.game_settings['match_available'])}
        </div>

        <div className="wager-region d-none d-md-flex">
          {utils.platform_icon(match.ladder.platform)}
        </div>

        <div className="start-time d-none d-md-flex">
          <span className="starts-in">
            {match.is_available_now
              ? 'AVAILABLE NOW'
              : moment(match.starts_at).fromNow()}
          </span>
        </div>
        <div className="wager-actions d-none d-md-flex">
          <Link
            to={matchLink('/m/' + match.id)}
            className="match-accept-link btn btn-primary"
          >
            {txt}
          </Link>

          {show_cancel ? (
            showCancelInit ? (
              <div>
                <button
                  onClick={() => {
                    props.initCancel(match);
                  }}
                  className="btn-danger btn cnclMt width-auto"
                >
                  SURE?
                </button>
                <button
                  onClick={() => {
                    setShowCancelInit(false);
                  }}
                  className=" cancel_btn btn-danger btn cnclMt width-auto"
                >
                  x
                </button>
              </div>
            ) : match.team_1_info.team_creator == props.user.id ? (
              <button
                onClick={() => {
                  setShowCancelInit(true);
                }}
                className="btn-danger btn cnclMt"
              >
                Cancel Match
              </button>
            ) : (
              false
            )
          ) : (
            false
          )}
        </div>
        <div className="d-md-none live-wager-arrow">
          {showDetails ? (
            <span
              className="fa fa-arrow-up"
              onClick={() => {
                setShowDetails(false);
              }}
            />
          ) : (
            <span
              className="fa fa-arrow-down"
              onClick={() => {
                setShowDetails(true);
              }}
            />
          )}
        </div>
      </div>
      {showDetails ? (
        <div className="live-wager-row live-wager-row-mobile d-md-none">
          <div className=" live-wager-mobile-block">
            <div className="info-block-left">
              <strong>Starts</strong>

              <strong>Team Size</strong>
              <strong>Platform</strong>
              <strong>Region</strong>
            </div>
            <div className="info-block-right">
              <span className="starts-in">
                {match.is_available_now
                  ? 'AVAILABLE NOW'
                  : moment(match.starts_at).fromNow()}
              </span>

              <span>
                {match.match_players}v{match.match_players}
              </span>
              <span>{utils.platform_icon(match.ladder.platform)}</span>
              <span>
                {utils.getCountryImage(match.game_settings['match_available'])}
              </span>
            </div>
          </div>
          <div className="wager-mobile-actions">
            <Link
              to={matchLink('/m/' + match.id)}
              className="match-accept-link btn btn-primary"
            >
              <span className="wager-hide-tablet">Accept</span>
            </Link>
            {show_cancel ? (
              showCancelInit ? (
                <div>
                  <button
                    onClick={() => {
                      props.initCancel(match);
                    }}
                    className="btn-danger btn cnclMt width-auto"
                  >
                    SURE?
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelInit(false);
                    }}
                    className=" cancel_btn btn-danger btn cnclMt width-auto"
                  >
                    x
                  </button>
                </div>
              ) : match.team_1_info.team_creator == props.user.id ? (
                <button
                  onClick={() => {
                    setShowCancelInit(true);
                  }}
                  className="btn-danger btn cnclMt width-100"
                >
                  Cancel Match
                </button>
              ) : (
                false
              )
            ) : (
              false
            )}
          </div>
        </div>
      ) : (
        false
      )}
    </div>
  );
};
export default SingleMatch;

//
// <li
//   key={match.id}
//   className="tournament-box"
//   style={{
//     backgroundImage: match.game.banner_url
//       ? 'url(' + match.game.banner_url + ')'
//       : "url('images/thumbnail_tournament.jpg')"
//   }}
// >
//   <div className="tournament-body">
//     <Link
//       to={this.matchLink('/m/' + match.id)}
//       className="tournament-name text-white"
//     >
//       <span
//         className={
//           game_user_ids.tag_icons[
//             match.ladder.gamer_tag
//           ] + ' float-none'
//         }
//       />
//
//     </Link>
//
//     <span className="date">
//       {moment(match.starts_at).format('lll')}
//     </span>
//     <span className="date">
//
//     </span>
//   </div>
//   <div className="tournament-footer">
//     <div className="row">
//       <div className="col-6 col-md-3 t-col">
//         <h5>Status</h5>
//         <p>{match.status}</p>
//       </div>
//       <div className="col-6 col-md-3 t-col">
//         <h5>TYPE</h5>
//         <p>
//           {match.match_type == 'free' ? (
//
//           )}
//         </p>
//       </div>
//       {/*}  <div className="col-6 col-md-3 t-col">
//         <h5>Prize pool</h5>
//         <p>
//           {match.match_type == 'paid'
//             ? '$ ' + match.match_fee
//             : '--'}
//         </p>
//       </div>*/}
//       <div className="col-6 col-md-3 t-col">
//         <h5>Players</h5>
//         <p>
//           {match.match_players}v
//           {match.match_players}
//         </p>
//       </div>
//     </div>
//
//     <div
//       className="col align-right"
//       style={{
//         flexDirection: 'column',
//         alignItems: 'flex-end'
//       }}
//     >
//       <Link
//         to={this.matchLink('/m/' + match.id)}
//         className="btn-default"
//       >
//         {txt}
//       </Link>
//
//     </div>
//   </div>
// </li>
