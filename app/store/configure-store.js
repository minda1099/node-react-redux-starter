import { applyMiddleware, compose, createStore } from 'redux';


//import middlewares
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import createLogger from 'redux-logger';
import reduxPromise from 'redux-promise';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';

export default function configureStore() {
  const middleware = compose(
    // applyMiddleware(createLogger()),
    applyMiddleware(reduxPromise),
    applyMiddleware(thunk),
    applyMiddleware(routerMiddleware(browserHistory))
  );
  
  const store = createStore(
    rootReducer,
    middleware
  );
  
  return store;
}