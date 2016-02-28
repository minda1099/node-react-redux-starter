import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import FacebookLogin from 'react-facebook-login';

import { fbLogin } from '../../actions';

class FbSettings extends Component {

    constructor(props){
        super(props);
        
    }
    renderFbCnct(){
        return (
            <FacebookLogin
                appId="1559504071030678"
                autoLoad={false}
                callback={this.props.fbLogin}
                size={'small'}
                fields={'email'}
                textButton="Connect to Facebook"
            />
        );
    }
    renderFbDsct(){
        const { hasPass } = this.props.auth;
        return (
            <button className={`btn btn-primary ${hasPass ?  '' : 'disabled' }`} >
                {hasPass ?  'Disconnect from Facebook' : 'Add password to disconnect' }  
            </button>
        );
    }

    render() {
        const { hasFb } = this.props.auth;
        return (
                <div className="btn-toolbar">
                    { hasFb ? this.renderFbDsct() : this.renderFbCnct() }
                </div>
        );
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({fbLogin}, dispatch);
}

function mapStateToProps(state) {
    return { auth: state.auth };
}

export default connect(mapStateToProps, mapDispatchToProps)(FbSettings);
