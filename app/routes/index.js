import React from 'react';
import { Route, IndexRoute } from 'react-router';
import  { Main, Register, Login } from '../containers';
import { Welcome, Settings } from '../components';

export default(
    <Route path='/' component={ Main } >
        <IndexRoute component={ Welcome }/>
        <Route path='/register' component={ Register }/>
        <Route path='/login' component={ Login }/>
        <Route path='/settings' component={ Settings }/>
    </Route>
);