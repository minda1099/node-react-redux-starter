import rootReducer from '../reducers';
import {applyMiddleware, compose, createStore} from 'redux';
import { syncHistory, routeReducer } from 'react-router-redux';
import { browserHistory } from 'react-router';

//import middlewares
import createLogger from 'redux-logger';
import reduxPromise from 'redux-promise';
import thunk from 'redux-thunk';

export default function configureStore(initialState) {
    let createStoreWithMiddleware;

    const logger = createLogger();
    const reduxRouterMiddleware = syncHistory(browserHistory);

    const middleware = applyMiddleware(
        reduxRouterMiddleware
        ,reduxPromise 
        ,thunk 
        //,logger
    );

    createStoreWithMiddleware = compose(
        middleware
        
    );

    const store = createStoreWithMiddleware(createStore)(rootReducer, initialState);

    return store;

}