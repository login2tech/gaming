const initialState = {
  modals: []
};

export default function modals(state = initialState, action) {
  if (!state.hydrated) {
    state = Object.assign({}, initialState, state, {hydrated: true});
  }
  switch (action.type) {
    case 'OPEN_MODAL':
      document && document.body.classList.add('no-scroll');
      return {
        ...state,
        modals: state.modals.concat(action.obj)
      };
    case 'CLOSE_MODAL': {
      const obj = {
        ...state,
        modals: state.modals.filter(item => item.id !== action.obj.id)
      };
      if (obj.modals.length == 0) {
        document && document.body.classList.remove('no-scroll');
      }
      return obj;
    }
    default:
      return state;
  }
}
