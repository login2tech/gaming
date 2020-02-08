const moment = require('moment');

function get_current_season() {
  let today = moment();
  today = today.add('6', 'months');
  const cur_year = today.format('YYYY');
  const next_year = parseInt(cur_year) + 1;
  if (today.isBetween(cur_year + '-03-19', cur_year + '-06-20', null, '[]')) {
    return [cur_year, 1];
  } else if (
    today.isBetween(cur_year + '-06-20', cur_year + '-09-22', null, '[]')
  ) {
    return [cur_year, 2];
  } else if (
    today.isBetween(cur_year + '-09-22', cur_year + '-12-21', null, '[]')
  ) {
    return [cur_year, 3];
  } else if (
    today.isBetween(cur_year + '-12-21', next_year + '-03-19', null, '[]')
  ) {
    return [cur_year, 4];
  } else if (today.isBefore(cur_year + '-03-19', 'YYYY-MM-DD')) {
    if (cur_year - 1 == 2019) {
      return [2020, 1];
    }
    return [cur_year - 1, 4];
  }
}

console.log(get_current_season());
