import { UPDATE_USER_REQUEST, UPDATE_USER_SUCCESS, UPDATE_USER_FAILURE, LOGOUT_USER, CLEAR_USER_STATUS } from '../constants';

import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { push } from 'react-router-redux';

import { checkHttpStatus, } from '../utils';

const ROOT_URL = 'https://node-starter-th3legend.c9users.io/api';

export function updateUserRequest() {
  return {
    type: UPDATE_USER_REQUEST,
  };
}

export function updateUserSuccess({ token, message, success, }) {
  localStorage.setItem('token', token);
  return {
    type: UPDATE_USER_SUCCESS,
    payload: {
      statusText: message,
      token,
      success,
    },
  };
}

export function updateUserFailure(error) {
  return {
    type: UPDATE_USER_FAILURE,
    payload: {
      statusText: error.data.message,
      success: error.data.success,
    },
  };
}

export function clearUserStatus() {
  return {
    type: CLEAR_USER_STATUS,
  };
}




export function registerUser(email, password) {
  return function(dispatch) {
    dispatch(updateUserRequest());
    axios.post(`${ROOT_URL}/auth/register`, {
        email,
        password,
      })
      .then(checkHttpStatus)
      .then(response => {
        try {
          jwtDecode(response.data.token);
          dispatch(updateUserSuccess(response.data));
          dispatch(push('/settings'));
        } catch (e) {
          dispatch(updateUserFailure({
            status: 403,
            data: {
              statusText: 'invalid token',
              success: false,
            },
          }));
        }
      })
      .catch(error => {
        dispatch(updateUserFailure(error));
      });
  };
}

export function loginUser(email, password) {
  return function(dispatch) {
    dispatch(updateUserRequest());
    axios.post(`${ROOT_URL}/auth/login`, {
      email,
      password,
    })
    .then(checkHttpStatus)
    .then(response => {
      try {
        jwtDecode(response.data.token);
        dispatch(updateUserSuccess(response.data));
        dispatch(push('/settings'));
      } catch (e) {
        dispatch(updateUserFailure({
          status: 403,
          data: {
            statusText: 'invalid token',
            success: false,
          },
        }));
      }
    })
    .catch(error => {
      dispatch(updateUserFailure(error));
    });
  };
}

export function fbLogin({ email, id, accessToken, }) {
  return function(dispatch) {
    dispatch(updateUserRequest());
    axios.post(`${ROOT_URL}/auth/facebook`, {
      token: localStorage.getItem('token'),
      email,
      id,
      accessToken,
    })
    .then(checkHttpStatus)
    .then(response => {
      try {
        jwtDecode(response.data.token);
        dispatch(updateUserSuccess(response.data));
        dispatch(push('/settings'));
      } catch (e) {
        dispatch(updateUserFailure({
          status: 403,
          data: {
            statusText: 'invalid token',
            success: false,
          },
        }));
      }
    })
    .catch(error => {
      dispatch(updateUserFailure(error));
    });
  };
}

export function gLogin({ code }) {
  
  return function(dispatch) {
    dispatch(updateUserRequest());
    axios.post(`${ROOT_URL}/auth/google`, {
      accessToken: code,
      token: localStorage.getItem('token'),
    })
    .then(checkHttpStatus)
    .then(response => {
      try {
        jwtDecode(response.data.token);
        dispatch(updateUserSuccess(response.data));
        dispatch(push('/settings'));
      } catch (e) {
        dispatch(updateUserFailure({
          status: 403,
          data: {
            statusText: 'invalid token',
            success: false,
          }
        }));
      }
    })
    .catch(error => {
      dispatch(updateUserFailure(error));
    });
  };
}


export function updateEmail(newEmail, password) {
  return function(dispatch) {
    dispatch(updateUserRequest());
    axios.put(`${ROOT_URL}/auth/update-email`, {
      token: localStorage.getItem('token'),
      newEmail,
      password,
    })
    .then(checkHttpStatus)
    .then(response => {
      try {
        jwtDecode(response.data.token);
        dispatch(updateUserSuccess(response.data));
        dispatch(push('/settings'));
      } catch (e) {
        dispatch(updateUserFailure({
          status: 403,
          data: {
            statusText: 'invalid token',
            success: false,
          }
        }));
      }
    })
    .catch(error => {
      dispatch(updateUserFailure(error));
    });
  };
}

export function updatePassword(currentPass, newPass) {
  return function(dispatch) {
    dispatch(updateUserRequest());
    axios.put(`${ROOT_URL}/auth/update-pass`, {
      currentPass: currentPass,
      token: localStorage.getItem('token'),
      newPass,
    })
    .then(checkHttpStatus)
    .then(response => {
      dispatch(updateUserSuccess(response.data));
      dispatch(push('/settings'));
    })
    .catch(error => {
      dispatch(updateUserFailure(error));
    });
  };
}

export function addPassword(newPass) {
  return function(dispatch) {
    dispatch(updateUserRequest());
    axios.put(`${ROOT_URL}/auth/add-pass`,{
      token: localStorage.getItem('token'),
      newPass,
    })
    .then(checkHttpStatus)
    .then(response => {
      dispatch(updateUserSuccess(response.data));
      dispatch(push('/settings'));
    })
    .catch(error => {
      dispatch(updateUserFailure(error));
    });
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
    dispatch(push('/'));
  };
}
