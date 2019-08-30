import moment from 'moment';
import cookie from 'react-cookie';
import {browserHistory} from 'react-router';

export function login(email, password) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/login', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: email,
        password: password
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'LOGIN_SUCCESS',
            token: json.token,
            user: json.user
          });
          cookie.save('token', json.token, {
            path: '/',
            expires: moment()
              .add(1, 'month')
              .toDate()
          });
          setTimeout(function(){
            window.location.href('/dashboard');  
          }, 500);
          
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'LOGIN_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function signup(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/signup', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(response => {
      return response.json().then(json => {
        if (response.ok) {
          dispatch({
            type: 'CONTACT_FORM_SUCCESS',
            messages: Array.isArray(json) ? json : [json]
          });
          cb && cb();
          // browserHistory.push('/');
          // cookie.save('token', json.token, {
          //   expires: moment()
          //     .add(1, 'month')
          //     .toDate()
          // });
        } else {
          dispatch({
            type: 'SIGNUP_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        }
      });
    });
  };
}

export function logout() {
  cookie.remove('token', {path: '/'});

  const redirectTO = '/';
  setTimeout(function() {
    location.href = redirectTO;
  }, 1000);
  return {
    type: 'LOGOUT_SUCCESS'
  };
}

export function forgotPassword(email) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/forgot', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: email})
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'FORGOT_PASSWORD_SUCCESS',
            messages: [json]
          });
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'FORGOT_PASSWORD_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function resetPassword(password, confirm, pathToken) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch(`/reset/${pathToken}`, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        password: password,
        confirm: confirm
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          browserHistory.push('/login');
          dispatch({
            type: 'RESET_PASSWORD_SUCCESS',
            messages: [json]
          });
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'RESET_PASSWORD_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function stopRenewal(data, token)
{
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/stopRenewal', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({type : data})
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'SUCCESS',
            messages: [json]
          });
          dispatch({
            type: 'UPDATE_USER',
            user: json.user
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

export function updateProfile(data, token) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/account', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'SUCCESS',
            messages: [json]
          });
          dispatch({
            type: 'UPDATE_USER',
            user: json.user
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

export function team_pic(team_id, data) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/teams/pics?' + team_id, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'UPDATE_PROFILE_SUCCESS',
            user: json.user
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

export function accountPic(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/accountPics', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        cb && cb(true);
        return response.json().then(json => {
          dispatch({
            type: 'UPDATE_USER',
            user: json.user
            // messages: [json]
            // new_user: json.user
          });
        });
      } else {
        cb && cb(false);
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

export function teamPic(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/teams/pics', {
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
        cb && cb(false);
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

export function changePassword(password, confirm, token) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/account', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        password: password,
        confirm: confirm
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'CHANGE_PASSWORD_SUCCESS',
            messages: [json]
          });
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'CHANGE_PASSWORD_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function deleteAccount(token) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/account', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch(logout());
          dispatch({
            type: 'DELETE_ACCOUNT_SUCCESS',
            messages: [json]
          });
        });
      }
    });
  };
}
