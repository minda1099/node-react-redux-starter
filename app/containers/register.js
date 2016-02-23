import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';

import { registerUser } from '../actions';

class Register extends Component {
    
    static contextTypes = {
        router: PropTypes.object
    };
    constructor(props){
        super(props);
        
        this.state = { error: '' };
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
        const { fields: { email, password }, handleSubmit } = this.props;
        return (
             <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <h2> Register </h2>
                <div className='form-group'>
                    <label> Email </label>
                    <input type="email" className="form-control" {...email} />
                    <div className="text-help">
                    </div>
                </div>
                <div className='form-group'>
                    <label> Password </label>
                    <input type="password" className="form-control" {...password}/>
                    <div className="text-help">
                    </div>
                </div>
                <div className='form-group'>
                    <small className="text-muted danger">
                      {this.state.error}
                    </small>
                </div>
                <button type="submit" className="btn btn-primary btn-margin"> Submit </button>
                <Link to="/" className="btn btn-danger btn-margin"> Cancel </Link>
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
   
    if(!email){
        errors.email = 'Enter a email';
    }
    if(!password){
        errors.password = 'Enter a password';
    }
    return errors;
}

export default reduxForm({
    form: 'Register',
    fields: ['email', 'password'],
    validate
},mapStateToProps, mapDispatchToProps)(Register);
