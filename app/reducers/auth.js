import { 
  UPDATE_USER_REQUEST, UPDATE_USER_SUCCESS, UPDATE_USER_FAILURE, LOGOUT_USER,
} from '../constants';
import jwtDecode from 'jwt-decode';

const INITIAL_STATE = {
  token: null,
  email: null,
  hasPass: false,
  isAuthenticated: false,
  isUpdating: false,
  statusText: null,
  success: null,
  hasFb: false,
  hasGoog: false
};


export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_USER_REQUEST:
      return {
        ...state, //take current state
        'isUpdating': true,
        'statusText': null,
      };
    case UPDATE_USER_SUCCESS:
      return {
        ...state, //take current state
        'isUpdating': false,
        'isAuthenticated': true,
        'token': action.payload.token,
          'email': jwtDecode(action.payload.token).email,
          'hasPass': jwtDecode(action.payload.token).hasPass,
          'statusText': action.payload.statusText,
          'success': action.payload.success,
          'hasFb': jwtDecode(action.payload.token).hasFb,
          'hasGoog': jwtDecode(action.payload.token).hasGoog,
      };
    case UPDATE_USER_FAILURE:
      return {
        ...state, //take current state
        'isUpdating': false,
        'statusText': action.payload.statusText,
          'success': action.payload.success,
      };
    case LOGOUT_USER:
      return {
        ...state, //take current state
        'isAuthenticated': false,
        'isUpdating': false,
        'token': null,
        'email': null,
        'hasPass': null,
        'statusText': null,
        'success': null,
        'hasFb': false,
        'hasGoog': false,
      };
    default:
      return state;
  }
}