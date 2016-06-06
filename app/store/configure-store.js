import { applyMiddleware, compose, createStore } from 'redux';

//import middlewares
import createLogger from 'redux-logger';
import reduxPromise from 'redux-promise';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';

export default function configureStore() {
  const middleware = compose(
    applyMiddleware(reduxPromise),
    applyMiddleware(thunk),
    applyMiddleware(createLogger())
  );
  
  const store = createStore(
    rootReducer,
    middleware
  );
  
  return store;
}