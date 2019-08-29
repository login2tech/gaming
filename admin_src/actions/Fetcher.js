const checkStatus = response => {
  // if (response.ok) {
  return response;
  // } else {
  //   // console.log(response);
  //   // const error = new Error(response);
  //   error.response = response;
  //   throw error;
  // }
};

const parseJSON = res => res.json();
const header = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};
const Fetcher = {
  get: (path, data, token) =>
    fetch(path, {
      method: 'GET',
      headers: token
        ? Object.assign({Authorization: `Bearer ${token}`}, header)
        : header
    })
      .then(checkStatus)
      .then(parseJSON),

  post: (path, data, token) =>
    fetch(path, {
      method: 'POST',
      headers: token
        ? Object.assign({Authorization: `Bearer ${token}`}, header)
        : header,
      body: JSON.stringify(data)
    })
      .then(checkStatus)
      .then(parseJSON)
};
export default Fetcher;
