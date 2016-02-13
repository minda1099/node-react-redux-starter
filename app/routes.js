import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Main from './components/main';
import Example from './components/example';

export default (
    <Route path="/" component={Main}>
            <IndexRoute component={Example} />
    </Route>
);