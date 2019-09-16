// import {browserHistory} from 'react-router';

export function createMatch8(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/money8/add', {
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
          window.location.href = '/mix-and-match/' + json.match.id;
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
    return fetch('/api/money8/join', {
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
          window.location.href = '/mix-and-match/' + json.match.id;
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
    return fetch('/api/money8/saveScore', {
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
          window.location.href = '/mix-and-match/' + json.match.id;
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
