export function sendMsg(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/messaging/newMsg', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'CONTACT_FORM_SUCCESS',
            messages: [json]
          });
          cb && cb(json.chatItem);
          // setTimeout(() => {
          //   window.location.href = '/dashboard/customer';
          // }, 1000);
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'CONTACT_FORM_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function sendMatchMsg(msg, match_id, match_type, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/dm/newMatchChat', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        msg: msg,
        match_id: match_id,
        match_type: match_type
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          cb && cb(json);
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'CONTACT_FORM_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}

export function sendDM(msg, id, cs, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/dm/newMsg', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        msg: msg,
        to_id: id,
        cs: cs
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'CONTACT_FORM_SUCCESS',
            messages: [json]
          });
          cb && cb(json);
          // setTimeout(() => {
          //   window.location.href = '/dashboard/customer';
          // }, 1000);
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'CONTACT_FORM_FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
        });
      }
    });
  };
}
