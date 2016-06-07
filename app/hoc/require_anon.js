import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

export default function(ComposedComponent, pushTo) {
  class Authentication extends Component {
    componentWillMount() {
      if(this.props.auth.isAuthenticated){
        this.props.dispatch(push(pushTo ? pushTo : '/'));
      }
    }
    componentWillUpdate(nextProps){
      if(nextProps.auth.isAuthenticated){
        this.props.dispatch(push(pushTo ? pushTo : '/'));
      }
    }
    render(){
      return <ComposedComponent {...this.props} />;
    }
  }
  
  function mapStateToProps(state){
    return { auth: state.auth, };
  }
  
  return connect(mapStateToProps)(Authentication);
}
