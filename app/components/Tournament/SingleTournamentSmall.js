import React from 'react';
import {Link} from 'react-router';
import utils from '../../utils';
const moment = require('moment');

const SingleTournamentSmall = props => {
  const {tour} = props;

  return (
    <div className="col-xs-12 col-sm-12 col-md-6 padding-tournament">
      <div className="tour-box small position-relative">
        <div
          className="tour-details row m-0 position-relative"
          style={
            tour.game.banner_url
              ? {
                  background:
                    'url(' + tour.game.banner_url + ') no-repeat center',
                  backgroundSize: 'cover'
                }
              : {}
          }
        >
          {tour.member_tournament ? (
            <img
              src="http://localhost:5000/assets/icons/ocg_member_gold.png"
              className="star_img"
            />
          ) : (
            false
          )}

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
                <span className="countdown-timer">
                  <span>Starts </span>{' '}
                  <span>{moment(tour.starts_at).fromNow()}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="tour-actions">
          <Link to={'/t/' + tour.id}>
            View <span className="fa fa-arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SingleTournamentSmall;
