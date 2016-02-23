import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/root';
import configureStore from './store/configure-store';
import {loginUserSuccess} from './actions';

const domMount = document.getElementById('mount');
const store = configureStore(window.__INITIAL_STATE__);


const rootComponent = (
    <Root store={store} />
);

let token = localStorage.getItem('token');
if (token !== null) {
    store.dispatch(loginUserSuccess(token));
}

ReactDOM.render(rootComponent, domMount);