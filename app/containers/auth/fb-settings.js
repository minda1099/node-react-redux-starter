import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FacebookLogin from 'react-facebook-login';

import { fbLogin } from '../../actions';

class FbSettings extends Component {
  static contextTypes = {
    auth:PropTypes.object,
    fbLogin:PropTypes.func,
  };
  constructor(props) {
    super(props);
  }
  renderFbCnct(){
    return (
      <FacebookLogin
        appId="1559504071030678"
        autoLoad={false}
        callback={this.props.fbLogin}
        cssClass="btn btn-primary btn-auth-settings"
        fields={'email'}
        textButton="Connect to Facebook"
      />
    );
  }
  renderFbDsct(){
    const hasPass = this.props.auth.get('hasPass');
    return (
      <button className={`btn btn-primary btn-auth-settings ${hasPass ?  '' : 'disabled' }`} >
        {hasPass ?  'Disconnect from Facebook' : 'Add password to disconnect' }  
      </button>
    );
  }
  render() {
    const hasFb = this.props.auth.get('hasFb');
    return (
      <div className="m-a-1">
        { hasFb ? this.renderFbDsct() : this.renderFbCnct() }
      </div>
    );
  }
}

const mapDispatchToProps  = (dispatch) => {
  return bindActionCreators({
    fbLogin,
  }, dispatch);
};

const mapStateToProps = ({auth}) => {
  return { 
    auth,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FbSettings);
