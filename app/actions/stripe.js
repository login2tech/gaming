export function charge(obj, token, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
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
          scrollToTop();
          if (json.action && json.action == 'PAYMENT_DONE') {
            cb(true, json);
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
        scrollToTop();
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

export function withdraw(obj, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/credits/withdraw', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          cb(true);
          dispatch({
            type: 'SUCCESS',
            messages: [json]
          });
        });
      } else {
        cb(false);
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

export function transfer(obj, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/credits/transfer', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          cb(true);
          setTimeout(function() {
            window.location.reload();
          }, 1000);
          dispatch({
            type: 'SUCCESS',
            messages: [json]
          });
        });
      } else {
        cb(false);
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

export function buy_membership(data, cb) {
  return dispatch => {
    dispatch({
      type: 'CLR_MSG'
    });
    return fetch('/api/credits/buy_membership', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          scrollToTop();
          if (json.ok) {
            cb(true, json);
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
        scrollToTop();
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
