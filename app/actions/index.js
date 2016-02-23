import { LOGIN_USER_REQUEST, LOGIN_USER_FAILURE, LOGIN_USER_SUCCESS, LOGOUT_USER, FETCH_PROTECTED_DATA_REQUEST, RECEIVE_PROTECTED_DATA } from '../constants';

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

export function receiveProtectedData(data) {
    return {
        type: RECEIVE_PROTECTED_DATA,
        payload: {
            data: data
        }
    }
}

export function fetchProtectedDataRequest() {
  return {
    type: FETCH_PROTECTED_DATA_REQUEST
  }
}

export function fetchProtectedData(token) {

    return (dispatch, state) => {
        dispatch(fetchProtectedDataRequest());
        return fetch('http://localhost:3000/getData/', {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(response => {
                dispatch(receiveProtectedData(response.data));
            })
            .catch(error => {
                if(error.response.status === 401) {
                  dispatch(loginUserFailure(error));
                  dispatch(pushState(null, '/login'));
                }
            });
       };
}