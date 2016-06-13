import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import { routerReducer as routing } from 'react-router-redux';

import auth from './auth';

const rootReducer = combineReducers({
  routing,
  form,
  auth,
});

export default rootReducer;