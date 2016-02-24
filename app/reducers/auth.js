import {LOGIN_USER_REQUEST, LOGIN_USER_SUCCESS, LOGIN_USER_FAILURE, LOGOUT_USER, UPDATE_USER_FAILURE, UPDATE_USER_SUCCESS } from '../constants';
import jwtDecode from 'jwt-decode';

const INITIAL_STATE = {
    token: null,
    email: null,
    isAuthenticated: false,
    isAuthenticating: false,
    statusText: null,
    success: null
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
                'statusText': action.payload.statusText,
                'success': true

            };
        case LOGIN_USER_FAILURE:
            return {
                ...state, //take current state
                'isAuthenticating': false,
                'isAuthenticated': false,
                'token': null,
                'email': null,
                'statusText': action.payload.statusText,
                'success': false
            };
        case UPDATE_USER_SUCCESS:
            return {
                ...state, //take current state
                'isAuthenticating': false,
                'statusText': action.payload.statusText,
                'success': true
            };            
        case UPDATE_USER_FAILURE:
            return {
                ...state, //take current state
                'isAuthenticating': false,
                'statusText': action.payload.statusText,
                'success': false
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