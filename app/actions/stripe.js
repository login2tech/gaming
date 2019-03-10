export function charge(obj, token, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/credits/new', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(obj)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          if (json.action && json.action == 'PAYMENT_DONE') {
            cb(true);
            dispatch({
              type: 'SUCCESS',
              messages: [json]
            });
          } else {
            cb(false);
            dispatch({
              type: 'FAILURE',
              messages: [json]
            });
          }
        });
      } else {
        cb();
        return response.json().then(json => {
          dispatch({
            type: 'FAILURE',
            messages: [json]
          });
        });
      }
    });
  };
}

export function chargeChange(id, token) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/downgrade', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        plan_id: id
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          if (json.action && json.action == 'DOWNGRADED') {
            dispatch({
              type: 'DOWNGRADE_SUCCESS',
              messages: [json],
              status: 'DOWNGRADED'
            });
            setTimeout(function() {
              window.location.reload();
            }, 300);
          } else {
            dispatch({
              type: 'DOWNGRADE_FAILURE',
              messages: [json],
              status: 'NO'
            });
          }
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'DOWNGRADE_FAILURE',
            messages: Array.isArray(json) ? json : [json],
            status: 'NO'
          });
        });
      }
    });
  };
}
