import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';

import { registerUser } from '../../actions';

class Register extends Component {
    
    static contextTypes = {
        router: PropTypes.object
    };
    constructor(props){
        super(props);
        
    }
    onSubmit(props){
        let { email, password } = this.props.fields;
        this.props.registerUser(email.value, password.value);
    }
    componentWillMount() {
        if(this.props.auth.isAuthenticated){//redirect to home if already auth'd
            this.context.router.push('/');
        }
    }
    
    render() {
        const { fields: { email, password }, handleSubmit, auth } = this.props;
        return (
             <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <h2> Register </h2>
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
                <div className="btn-toolbar">
                    <button type="submit" className={`btn btn-primary ${auth.isAuthenticating ? 'disabled' : ''}` }> {auth.isAuthenticating ? 'loading...' : 'Submit'} </button>
                    <Link to="/" className={`btn btn-danger ${auth.isAuthenticating ? 'disabled' : ''}` }> Cancel </Link>
                </div>
            </form>
        );
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({registerUser}, dispatch);
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
    form: 'Register',
    fields: ['email', 'password'],
    validate
},mapStateToProps, mapDispatchToProps)(Register);
