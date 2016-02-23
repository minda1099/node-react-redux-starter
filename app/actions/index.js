import { LOGIN_USER_REQUEST, LOGIN_USER_FAILURE, LOGIN_USER_SUCCESS, LOGOUT_USER} from '../constants';

import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { routeActions } from 'react-router-redux';


import { checkHttpStatus, parseJSON } from '../utils';

const ROOT_URL = 'https://node-starter-th3legend.c9users.io/api';

export function loginUserSuccess(token) {
  localStorage.setItem('token', token);
  return {
    type: LOGIN_USER_SUCCESS,
    payload: {
      token: token
    }
  }
}

export function loginUserFailure(error) {
  localStorage.removeItem('token');
  return {
    type: LOGIN_USER_FAILURE,
    payload: {
      status: error.status,
      statusText: error.data.error
    }
  };
}

export function loginUserRequest() {
  return {
    type: LOGIN_USER_REQUEST
  };
}

export function logout() {
    localStorage.removeItem('token');
    return {
        type: LOGOUT_USER
    };
}

export function logoutAndRedirect() {
    return (dispatch, state) => {
        dispatch(logout());
        dispatch(routeActions.push('/'));
    };
}

export function registerUser(email, password) {
     return function(dispatch) {
        dispatch(loginUserRequest());
        axios.post(`${ROOT_URL}/auth/register`, 
        {
            email: email, 
            password: password
        })
            .then(checkHttpStatus)
            .then(response => {
                try {
                    let decoded = jwtDecode(response.data.token);
                    dispatch(loginUserSuccess(response.data.token));
                    dispatch(routeActions.push('/'));
                } catch (e) {
                    dispatch(loginUserFailure({
                        response: {
                            status: 403,
                            statusText: 'Invalid token'
                        }
                    }));
                }
            })
            .catch(error => {
                dispatch(loginUserFailure(error));
            });
    };
}

export function loginUser(email, password) {
     return function(dispatch) {
        dispatch(loginUserRequest());
        axios.post(`${ROOT_URL}/auth/login`, 
        {
            email: email, 
            password: password
        })
            .then(checkHttpStatus)
            .then(response => {
                try {
                    let decoded = jwtDecode(response.data.token);
                    dispatch(loginUserSuccess(response.data.token));
                    dispatch(routeActions.push('/'));
                } catch (e) {
                    dispatch(loginUserFailure({
                        response: {
                            status: 403,
                            statusText: 'Invalid token'
                        }
                    }));
                }
            })
            .catch(error => {
                dispatch(loginUserFailure(error));
            });
    };
}