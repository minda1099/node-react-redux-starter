import * as types from '../constants';
import jwtDecode from 'jwt-decode';
import { Map } from 'immutable';  

const INITIAL_STATE = Map({ 
  token: null,
  email: null,
  hasPass: false,
  isAuthenticated: false,
  isUpdating: false,
  statusText: null,
  success: null,
  hasFb: false,
  hasGoog: false,
});

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_USER_REQUEST:
      return state
        .set('isUpdating', true)
        .set('statusText', null);
    case types.UPDATE_USER_SUCCESS:
      const { token, statusText, success } = action.payload;
      const { email, hasPass, hasFb, hasGoog } = jwtDecode(token);
      return state
        .set('isUpdating', false)
        .set('isAuthenticated', true)
        .set('token', token)
        .set('email', email)
        .set('hasPass', hasPass)
        .set('statusText', statusText)
        .set('success', success)
        .set('hasFb', hasFb)
        .set('hasGoog', hasGoog);
    case types.UPDATE_USER_FAILURE:
      return state
        .set('isUpdating', false)
        .set('statusText', action.payload.statusText)
        .set('success', action.payload.success);
    case types.CLEAR_USER_STATUS:
      return state
        .set('isUpdating', false)
        .set('statusText', null)
        .set('success', null);
    case types.LOGOUT_USER:
      return state
        .set('isUpdating', false)
        .set('isAuthenticated', false)
        .set('token', null)
        .set('email', null)
        .set('hasPass', null)
        .set('statusText', null)
        .set('success', null)
        .set('hasFb', false)
        .set('hasGoog', false);
    default:
      return state;
  }
}