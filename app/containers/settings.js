import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { routeActions } from 'react-router-redux';




class Settings extends Component {
    
    static contextTypes = {
        router: PropTypes.object
    };
    
    constructor(props){
        super(props);
    }

    componentWillMount() {
        if(!this.props.auth.isAuthenticated){//redirect to home if already auth'd
            this.context.router.push('/login');
        }
    }

    render(){
        return (
            <div> Settings Page </div>
        );
    }
    
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({}, dispatch);
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
    form: 'settings',
    fields: ['email', 'password'],
    validate
},mapStateToProps, mapDispatchToProps)(Settings);
