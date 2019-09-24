const initialState = [];

export default function auth(state = initialState, action) {
  if (!state.hydrated) {
    state = Object.assign({}, initialState, state, {hydrated: true});
  }
  switch (action.type) {
    default:
      return state;
  }
}
