import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';

import {loginUser, fbLogin, gLogin} from '../../actions';

class Login extends Component {
    
    static contextTypes = {
        router: PropTypes.object
    };
    constructor(props){
        super(props);
        
        this.state = { error: '' };
    }
    onSubmit(props){
        let { email, password } = this.props.fields;
        this.props.loginUser(email.value, password.value);
    }
    componentWillMount() {
        if(this.props.auth.isAuthenticated){//redirect to home if already auth'd
            this.context.router.push('/');
        }
    }
    
    render() {
        const { fields: { email, password }, handleSubmit, auth } = this.props;
        return (
            <div className="col-md-6 offset-md-3 col-sm-12 margin-top-50 ">
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <h2 className="text-md-center"> LOGIN </h2>
                    <div className={`form-group ${email.touched && email.invalid ? 'has-danger' : ''}`}>
                        <label> Email </label>
                        <input type="email" className="form-control" {...email} />
                        <div className="text-help">
                            {email.touched ? email.error : ''}
                        </div>
                    </div>
                    <div className={`form-group ${password.touched && password.invalid ? 'has-danger' : ''}`}>
                        <label> Password </label>
                        <input type="password" className="form-control" {...password}/>
                        <div className="text-help">
                            {password.touched ? password.error : ''}
                        </div>
                    </div>
                    <div className='form-group has-danger'>
                        <small className="text-muted text-help ">
                            {auth.statusText}
                        </small>
                    </div>
                    <hr/>
                    <div className="btn-toolbar container">
                        <button type="submit" className={`btn btn-success btn-inline  btn-auth ${auth.isUpdating ? 'disabled' : ''}` }> {auth.isUpdating ? 'loading...' : 'Login'} </button>
                        <FacebookLogin
                            appId="1559504071030678"
                            autoLoad={false}
                            callback={this.props.fbLogin}
                            cssClass="btn btn-primary btn-inline btn-auth"
                            textButton="Facebook"
                            fields={'email'}
                        />
                        <GoogleLogin
                            clientId={'658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com'}
                            callback={this.props.gLogin}
                            offline={true}
                            cssClass="btn btn-danger btn-inline btn-auth"
                            buttonText="Google"
                        />
                    </div>
                </form>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({loginUser, fbLogin, gLogin}, dispatch);
}

function mapStateToProps(state) {
    return { auth: state.auth };
}

function validate({email, password}) {
    const errors = {};
   
    if (!email) {
        errors.email = 'Enter an email address';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
        errors.email = 'Invalid email address';
    }
    if (!password) {
        errors.password = 'Enter a password';
    } else if (password.length < 8) {
        errors.password = 'Password must be atleast 8 characters long';
    }
    return errors;
}


export default reduxForm({
    form: 'login',
    fields: ['email', 'password'],
    validate
},mapStateToProps, mapDispatchToProps)(Login);
