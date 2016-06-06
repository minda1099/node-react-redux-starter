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

let token = localStorage.getItem('token');
let data = {
  token: token,
  success: true,
  message: null
};
if (token !== null) {
  store.dispatch(updateUserSuccess(data));
}

const domMount = document.createElement('div');
document.body.appendChild(domMount);

ReactDOM.render(rootComponent, domMount);