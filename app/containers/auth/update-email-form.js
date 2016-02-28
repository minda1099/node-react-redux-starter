import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { routeActions } from 'react-router-redux';

import { updateEmail, updatePassword} from '../../actions';

class UpdateEmailForm extends Component {
    
    static contextTypes = {
        router: PropTypes.object
    };
    
    onSubmit(props){
        let { newEmail, password } = this.props.fields;
        this.props.updateEmail(newEmail.value, password.value);
    }

    renderConfirmPass(){
        const { fields: { newEmail, password }, handleSubmit, auth } = this.props;
        return (
                <div>
                    <div className={`form-group ${password.touched && password.invalid ? 'has-danger' : ''}`}>
                        <label> Confirm Password </label>
                        <input type="password" className="form-control" {...password}/>
                        <div className="text-help">
                            {password.touched ? password.error : ''}
                        </div>
                    </div>
                    <div className={`form-group ${auth.success ? 'has-success' : 'has-danger'}`}>
                        <small className="text-muted text-help ">
                            {auth.statusText}
                        </small>
                    </div>
                    <div className="btn-toolbar">
                        <button type="submit" className={`btn btn-primary ${auth.isUpdating ? 'disabled' : ''}` }> {auth.isUpdating ? 'loading...' : 'Submit'} </button>
                    </div>
                </div>
        )
    }

    render() {
        const { fields: { newEmail, password }, handleSubmit, auth } = this.props;
        console.log(auth);
        return (
             <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <div className={`form-group ${newEmail.touched && newEmail.invalid ? 'has-danger' : ''}`}>
                    <label> Email </label>
                    <input type="email" className="form-control"  value={auth.email} {...newEmail} />
                    <div className="text-help">
                        {newEmail.touched ? newEmail.error : ''}
                    </div>
                </div>
                    {newEmail.touched || newEmail.active  ? this.renderConfirmPass() : ''}
            </form>
        );
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ updateEmail, updatePassword }, dispatch);
}

function mapStateToProps(state) {
    return { auth: state.auth };
}

function validate({newEmail, password}) {
    const errors = {};
    
    if (!newEmail) {
        errors.newEmail = 'Enter an email address';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newEmail)) {
        errors.newEmail = 'Invalid email address';
    }
    if(!password){
        errors.password = 'Enter a password';
    }
    return errors;
}

export default reduxForm({
    form: 'update-email',
    fields: ['newEmail', 'password'],
    validate
},mapStateToProps, mapDispatchToProps)(UpdateEmailForm);