export function createMatch(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
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
      type: 'CLR_MSG'
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

export function rejectChallenge(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/matches/rejectChallenge', {
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
      type: 'CLR_MSG'
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

export function saveScores(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
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
          // window.location.href = '/m/' + json.match.id;
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
