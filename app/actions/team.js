import {browserHistory} from 'react-router';

export function createTeam(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/teams/add', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'SUCCESS',
            messages: Array.isArray(json) ? json : [json]
          });

          browserHistory.push('/u/' + user.username + '/teams/' + json.team.id);
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function inviteToTeam(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/teams/invite', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'SUCCESS',
            messages: Array.isArray(json) ? json : [json]
          });

          cb(true);
          // browserHistory.push('/u/' + user.username + '/teams/' + json.team.id);
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
          cb(false);
        });
      }
    });
  };
}
