import React from 'react';
import { Route, IndexRoute } from 'react-router';
import  { Main, Register, Login } from '../containers';
import { Welcome, Settings } from '../components';
import { RequireAuth, RequireAnon } from '../hoc';

export default(
  <Route path='/' component={ Main } >
    <IndexRoute component={ Welcome }/>
    <Route path='/register' component={ RequireAnon(Register, '/settings') }/>
    <Route path='/login' component={ RequireAnon(Login, '/settings') }/>
    <Route path='/settings' component={ RequireAuth(Settings, '/login') }/>
  </Route>
);