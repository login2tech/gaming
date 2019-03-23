export function add_post(data, token, cb) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/api/posts/add', {
      method: 'post',
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
            messages: Array.isArray(json) ? json : [json]
          });
          cb && cb(true, json.post);
          // window.location.href = '/m/' + json.match.id;
        });
      } else {
        return response.json().then(json => {
          dispatch({
            type: 'FAILURE',
            messages: Array.isArray(json) ? json : [json]
          });
          cb && cb(false);
        });
      }
    });
  };
}
