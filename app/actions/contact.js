export function submitContactForm(name, email, subject, message) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/contact', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: name,
        email: email,
        subject: subject,
        message: message
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          dispatch({
            type: 'CONTACT_FORM_SUCCESS',
            messages: [json]
          });
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

export function applyForStaff(data) {
  return dispatch => {
    dispatch({
      type: 'CLEAR_MESSAGES'
    });
    return fetch('/contact_apply', {
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
