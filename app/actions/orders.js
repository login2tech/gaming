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
