import React from 'react';
import { Provider } from 'react-redux';
import { browserHistory, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import routes from '../routes';

export default class Root extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
  }
  render() {
    const history = syncHistoryWithStore(browserHistory, this.props.store);
    return (
      <Provider store={this.props.store}>
        <Router history={history} routes={routes} />
      </Provider>
    );
  }
}