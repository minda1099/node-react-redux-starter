import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import GoogleLogin from 'react-google-login';

import { googLogin } from '../../actions';

class GoogSettings extends Component {

    constructor(props){
        super(props);
        
    }
    renderGoogCnct(){
        return (
            <div className="btn-toolbar">
                <GoogleLogin
                    clientId={'658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com'}
                    callback={this.props.gLogin}
                    offline={true}
                />
            </div>
        );
    }
    renderGoogDsct(){
        const { hasPass } = this.props.auth;
        return (
            <button className={`btn btn-danger ${hasPass ?  '' : 'disabled' }`} >
                {hasPass ?  'Disconnect from Google' : 'Add password to disconnect' }  
            </button>
        );
    }

    render() {
        const { hasGoog } = this.props.auth;
        return (
                <div className="btn-toolbar">
                    { hasGoog ? this.renderGoogDsct() : this.renderGoogCnct() }
                </div>
        );
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({googLogin}, dispatch);
}

function mapStateToProps(state) {
    return { auth: state.auth };
}

export default connect(mapStateToProps, mapDispatchToProps)(GoogSettings);
