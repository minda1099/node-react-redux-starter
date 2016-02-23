import {LOGIN_USER_REQUEST, LOGIN_USER_SUCCESS, LOGIN_USER_FAILURE, LOGOUT_USER} from '../constants';
import jwtDecode from 'jwt-decode';

const INITIAL_STATE = {
    token: null,
    email: null,
    isAuthenticated: false,
    isAuthenticating: false,
    statusText: null
};


export default function(state = INITIAL_STATE, action){
    switch(action.type){
        case LOGIN_USER_REQUEST:
            return {
                ...state, //take current state
                'isAuthenticating': true,
                'statusText': null
            };
        case LOGIN_USER_SUCCESS:
            return {
                ...state, //take current state
                'isAuthenticating': false,
                'isAuthenticated': true,
                'token': action.payload.token,
                'email': jwtDecode(action.payload.token).email,
                'statusText': 'You have been successfully logged in.'
            };
        case LOGIN_USER_FAILURE:
            return {
                ...state, //take current state
                'isAuthenticating': false,
                'isAuthenticated': false,
                'token': null,
                'email': null,
                'statusText': `${action.payload.statusText}`
            };
        case LOGOUT_USER:
            return {
                ...state, //take current state
                'isAuthenticated': false,
                'token': null,
                'email': null,
                'statusText': null
            };
        default:
            return state;
    }
}