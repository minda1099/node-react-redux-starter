import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { routerReducer } from 'react-router-redux'

import auth from './auth';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  auth,
});

export default rootReducer;