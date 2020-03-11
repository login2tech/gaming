import {browserHistory} from 'react-router';
export function changeTname(data, cb) {
  return dispatch => {
    dispatch({type: 'CLR_MSG'});

    return fetch('/api/teams/changeName', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          if (json.ok) {
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            alert(json.msg);
            cb && cb(false);
          }
        });
      } else {
        alert('Failed!');
      }
    });
  };
}
export function createTeam(data, user) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
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
setTimeout(()=>{
  browserHistory.push('/u/' + user.username + '/teams/' + json.team.id);
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

export function inviteToTeam(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
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

export function approveRequest(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/teams/approve', {
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

export function removeMembers(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/teams/removeMembers', {
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

export function disband(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/teams/disband', {
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

export function teamPic(data, team_id, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/teams/pics?team_id=' + team_id, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      cb && cb(true);
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'UPDATE_PROFILE_SUCCESS'
            //  user: json.user
            // messages: [json]
            // new_user: json.user
          });
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'UPDATE_PROFILE_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}
