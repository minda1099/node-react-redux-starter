import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/root';
import configureStore from './store/configure-store';
import { updateUserSuccess } from './actions';

//assets need to modularize
require('./assets/index.scss');

const store = configureStore();

const rootComponent = (
  <Root store={store} />
);

const token = localStorage.getItem('token');
const data = {
  success: true,
  message: null,
  token,
};
if (token) {
  store.dispatch(updateUserSuccess(data));
}

const domMount = document.createElement('div');
document.body.appendChild(domMount);

ReactDOM.render(rootComponent, domMount);