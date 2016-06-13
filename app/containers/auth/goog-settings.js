import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleLogin from 'react-google-login';

import { gLogin } from '../../actions';

class GoogSettings extends Component {
  static contextTypes = {
    auth:PropTypes.object,
    gLogin:PropTypes.func,
  };
  constructor(props){
    super(props);
  }
  renderGoogCnct(){
    return (
      <GoogleLogin
        clientId={'658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com'}
        callback={this.props.gLogin}
        offline={true}
        cssClass="btn btn-danger btn-auth-settings"
      />
    );
  }
  renderGoogDsct(){
    const { hasPass } = this.props.auth;
    return (
      <button className={`btn btn-danger btn-auth-settings ${hasPass ?  '' : 'disabled' }`} >
        {hasPass ?  'Disconnect from Google' : 'Add password to disconnect' }  
      </button>
    );
  }
  render() {
    const { hasGoog } = this.props.auth;
    return (
      <div className="m-a-1">
        { hasGoog ? this.renderGoogDsct() : this.renderGoogCnct() }
      </div>
    );
  }
}

const mapDispatchToProps  = (dispatch) => {
  return bindActionCreators({
    gLogin,
  }, dispatch);
};

const mapStateToProps = ({auth}) => {
  return { 
    auth,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GoogSettings);
