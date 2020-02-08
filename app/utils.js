import React from 'react';
import moment from 'moment';
const utils = {
  platform_icon: function(name) {
    if (!name) {
      return;
    }
    name = name.toLowerCase();
    if (name.indexOf('xbox') > -1 || name.indexOf('x box') > -1) {
      return <span className="fab fa-xbox" />;
    }
    if (name.indexOf('playstation') > -1) {
      return <span className="fab fa-playstation" />;
    } else if (name.indexOf('pc') > -1) {
      return <span className="fa fa-desktop" />;
    } else if (name.indexOf('crossplatform') > -1) {
      return <span className="fa fa-cubes" />;
    }
    return false;
  },

  getMeterPercent: function(xp) {
    if (xp < 0) {
      xp = 0;
    }
    let op = 0;
    if (xp < 50) {
      op = (xp * 10) / 5;
    } else if (xp < 200) {
      op = ((xp - 50) / 150) * 100;
    } else if (xp < 500) {
      op = ((xp - 200) / 300) * 100;
    } else if (xp < 750) {
      op = ((xp - 500) / 250) * 100;
    } else if (xp < 1000) {
      op = ((xp - 750) / 250) * 100;
    } else if (xp < 1500) {
      op = ((xp - 1000) / 500) * 100;
    } else if (xp < 2000) {
      op = ((xp - 1500) / 500) * 100;
    } else if (xp < 3000) {
      op = ((xp - 2000) / 1000) * 100;
    } else if (xp < 3500) {
      op = ((xp - 3000) / 500) * 100;
    } else if (xp < 4000) {
      op = ((xp - 3500) / 500) * 100;
    } else {
      op = 100;
    }
    return op.toFixed(2);
  },
  getMeterImage: function(xp) {
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
    return 'veteran';
  },
  getMeterMax: function(xp) {
    if (xp <= 0) {
      xp = 0;
    }
    if (xp <= 50) {
      return '50';
    }
    if (xp <= 200) {
      return '200';
    }
    if (xp <= 500) {
      return '500';
    }

    if (xp <= 750) {
      return '750';
    }
    if (xp <= 1000) {
      return '1000';
    }
    if (xp <= 1500) {
      return '1500';
    }
    if (xp <= 2000) {
      return '2000';
    }
    if (xp <= 3000) {
      return '3000';
    }
    if (xp <= 3500) {
      return '3500';
    }
    if (xp <= 4000) {
      return '4000';
    }
    return '999999';
  },
  getMeterMin: function(xp) {
    if (xp < 0) {
      xp = 0;
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
    if (xp < 750) {
      return '500';
    }
    if (xp < 1000) {
      return '750';
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
    return '4000';
  },

  get_current_season: function() {
    const today = moment();
    // today = today.add('6', 'months');
    let cur_year = today.format('YYYY');
    cur_year = '' + cur_year;
    const next_year = parseInt(cur_year) + 1;
    if (today.isBetween(cur_year + '-03-19', cur_year + '-06-20', null, '[]')) {
      return [parseInt(cur_year), 1];
    } else if (
      today.isBetween(cur_year + '-06-20', cur_year + '-09-22', null, '[]')
    ) {
      return [parseInt(cur_year), 2];
    } else if (
      today.isBetween(cur_year + '-09-22', cur_year + '-12-21', null, '[]')
    ) {
      return [parseInt(cur_year), 3];
    } else if (
      today.isBetween(cur_year + '-12-21', next_year + '-03-19', null, '[]')
    ) {
      return [parseInt(cur_year), 4];
    } else if (today.isBefore(cur_year + '-03-19', 'YYYY-MM-DD')) {
      if (cur_year - 1 == 2019) {
        return [2020, 1];
      }
      return [parseInt(cur_year) - 1, 4];
    }
  }
};
export default utils;
