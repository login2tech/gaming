import React from 'react';
import {Link} from 'react-router';
import utils from '../../utils';
const SingleTournament = props => {
  const {tour} = props;
  const moment = require('moment');

  return (
    <div className="col-xs-12 col-sm-12 col-md-6 padding-tournament">
      <div className="tour-box ">
        <div className="tour-details row m-0">
          <div className="tour-cover-block col-3">
            {tour.member_tournament ? (
              <img
                src="http://localhost:5000/assets/icons/ocg_member_gold.png"
                className="star_img"
              />
            ) : (
              false
            )}
            <div className="cover-image">
              <img
                className="logo-image ls-is-cached lazyloaded"
                src={tour.game.image_url}
              />
            </div>
          </div>
          <div className="col-9">
            <div className="tour-description-block">
              <div className="name-block">
                <div className="tour-platform">
                  {utils.platform_icon(tour.ladder.platform)}
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
                  <span data-v-d7de8704="" className="countdown-timer">
                    <span data-v-d7de8704="">Starts </span>{' '}
                    <span data-v-d7de8704="">
                      {moment(tour.starts_at).fromNow()}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="tour-stats-block">
              <div className="tour-stats flex-3">
                <small>ENTRY/PLAYER</small>{' '}
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

              <small> </small>

              <div className="tour-stats hidden-xs hidden-sm">
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
        <Link to={'/t/' + tour.id}>
          View Tournament <span className="fa fa-arrow-right" />
        </Link>
      </div>
    </div>
  );
};
export default SingleTournament;
