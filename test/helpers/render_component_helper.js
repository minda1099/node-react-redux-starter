/* global $ */
import React from 'react';
import ReactDom from 'react-dom';
import chai from 'chai';
import { renderIntoDocument, Simulate } from 'react-addons-test-utils';

import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import reduxPromise from 'redux-promise';
import thunk from 'redux-thunk';

import rootReducer from 'reducers';

function renderComponent(ComponentClass, props) {
  const middleware = compose(
    applyMiddleware(reduxPromise),
    applyMiddleware(thunk)
  );
  const store = createStore(
    rootReducer,
    middleware
  );
  const componentInstance = renderIntoDocument(
    <Provider store={store} key="provider">
      <ComponentClass {...props} />
    </Provider>
  );

  chai.use(require('chai-jquery'));

  $.fn.simulate = function simulate(eventName, value) {
    if (value) this.val(value);
    Simulate[eventName](this[0]);
  };

  return $(ReactDom.findDOMNode(componentInstance));
}

export default renderComponent;
