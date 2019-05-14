import {combineReducers} from 'redux';
import messages from './messages';
import auth from './auth';
import settings from './settings';
import modals from './modals';

import {localizeReducer} from 'react-localize-redux';
export default combineReducers({
  messages,
  auth,
  modals,
  settings,
  localize: localizeReducer
});
