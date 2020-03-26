import React from 'react';
import {Link} from 'react-router';
import utils from '../../utils';
const moment = require('moment');

const SingleTournament = props => {
  const {tour} = props;
  if (typeof tour.game_settings === 'string') {
    tour.game_settings = JSON.parse(tour.game_settings);
  }

  return (
    <div className="col-xs-12 col-sm-12 col-md-6 padding-tournament">
      <div className="tour-box position-relative ">
        <div className="tour-details row m-0 position-relative ">
          {tour.member_tournament ? (
            <img src="/assets/icons/ocg_member_gold.png" className="star_img" />
          ) : (
            false
          )}
          <div
            className="tour-cover-block col-md-3 col-12"
            style={
              tour.game.image_url
                ? {
                    background:
                      'url(' + tour.game.image_url + ') no-repeat center',
                    backgroundSize: 'cover'
                  }
                : {}
            }
          >
            <div className="cover-image">
              <img
                className="logo-image ls-is-cached lazyloaded"
                src={tour.game.image_url}
              />
            </div>
          </div>
          <div className="col-md-9 col-12">
            <div className="tour-description-block">
              <div className="name-block">
                <div className="tour-platform">
                  <div className="mb-1">
                    {tour.game_settings && tour.game_settings['match_available']
                      ? utils.getCountryImage(
                          tour.game_settings['match_available']
                        )
                      : false}
                  </div>
                  <div>{utils.platform_icon(tour.ladder.platform)}</div>
                </div>
                <p className="tour-name" tabIndex="0">
                  {tour.title} <br />
                  <small>
                    {tour.game.title} - {tour.ladder.title}
                  </small>
                </p>
              </div>
              <div className="region-block">
                <div className="region-content">
                  <span className="countdown-timer">
                    <span>
                      {moment(tour.starts_at).isAfter(moment())
                        ? 'Starts'
                        : 'Started'}{' '}
                    </span>{' '}
                    <span>{moment(tour.starts_at).fromNow()}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="tour-stats-block">
              <div className="tour-stats flex-3">
                <small>ENTRY per PLAYER</small>{' '}
                <p>
                  {tour.entry_fee} <span className="credits-info">credits</span>
                </p>
              </div>
              <div className="tour-stats">
                <small>PRIZE</small>{' '}
                <p>
                  $
                  {tour.first_winner_price +
                    tour.second_winner_price +
                    tour.third_winner_price}
                </p>
              </div>
              <div className="tour-stats">
                <small>MAX TEAMS</small> <p>{tour.total_teams}</p>
              </div>
              <div className="tour-stats">
                <small>ENROLLED</small> <p>{tour.teams_registered}</p>
              </div>
              <div className="tour-stats">
                <small>TEAM SIZE</small>{' '}
                <p>
                  {tour.max_players} vs {tour.max_players}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="tour-actions">
          <Link to={'/t/' + tour.id}>
            View Tournament <span className="fa fa-arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SingleTournament;
