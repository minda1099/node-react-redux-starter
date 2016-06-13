import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Helmet from "react-helmet";

import { logoutAndRedirect } from '../actions';

import NavBar  from './nav-bar';

class Main extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Helmet 
          title='React Redux Node' 
          meta={[
            {"name": "viewport", "content": "width=device-width, initial-scale=1"},
          ]}
        />
        <NavBar />
        <div className="container">
          <div className="row">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    logoutAndRedirect,
  }, dispatch);
};

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
