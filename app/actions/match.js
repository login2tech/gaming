// import {browserHistory} from 'react-router';

export function createMatch(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/matches/add', {
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
          setTimeout(function() {
            window.location.href = '/m/' + json.match.id;
          }, 1000);
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

export function leave_match(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/matches/leave_match', {
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
          setTimeout(function() {
            window.location.href = '/m/' + data.match_id;
          }, 1000);
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

export function join_match(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/matches/join', {
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
          window.location.href = '/m/' + json.match.id;
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

export function saveScores(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/matches/saveScore', {
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
          window.location.href = '/m/' + json.match.id;
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

export function approveMatch(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/matches/approve', {
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
