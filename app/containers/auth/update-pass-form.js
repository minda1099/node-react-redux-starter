import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { routeActions } from 'react-router-redux';

import { updatePassword } from '../../actions';

class UpdatePassForm extends Component {
    
    static contextTypes = {
        router: PropTypes.object
    };
    
    constructor(props){
        super(props);
        
        this.state = {
            showForm: false
        }
    }
    
    toggleForm(){
        this.setState({
            showForm: this.state.showForm ? false : true
        });
    }
    
    onSubmit(props){
        let { oldPassword, newPassword } = this.props.fields;
        this.props.updatePassword(oldPassword.value, newPassword.value);
    }
    renderUpdatePass(){
        const { fields: { oldPassword, newPassword, newPassword2 }, handleSubmit, auth } = this.props;
        return (
             <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <div className={`form-group ${oldPassword.touched && oldPassword.invalid ? 'has-danger' : ''}`}>
                    <label> Current Password </label>
                    <input type="password" className="form-control"  {...oldPassword} />
                    <div className="text-help">
                        {oldPassword.touched ? oldPassword.error : ''}
                    </div>
                </div>
                <div className={`form-group ${newPassword.touched && newPassword.invalid ? 'has-danger' : ''}`}>
                    <label> New Password </label>
                    <input type="password" className="form-control" {...newPassword}/>
                    <div className="text-help">
                        {newPassword.touched ? newPassword.error : ''}
                    </div>
                </div>
              <div className={`form-group ${newPassword2.touched && newPassword2.invalid ? 'has-danger' : ''}`}>
                    <label> New Password Confirm </label>
                    <input type="password" className="form-control" {...newPassword2}/>
                    <div className="text-help">
                        {newPassword2.touched ? newPassword2.error : ''}
                    </div>
                </div>
                <div className={`form-group ${auth.success ? 'has-success' : 'has-danger'}`}>
                    <small className="text-muted text-help ">
                        {auth.statusText}
                    </small>
                </div>
                <div className="btn-toolbar">
                    <button type="submit" className={`btn btn-primary ${auth.isUpdating ? 'disabled' : ''}` }> {auth.isUpdating ? 'loading...' : 'Save'} </button>
                </div>
            </form>
        );
    }
    renderHasPass(){
        return (
            <div>
                <span className="react-link react-link-underline" onClick={this.toggleForm.bind(this)}> 
                    {this.state.showForm ? 'Hide Password Update' : 'Update Password'} 
                </span>
                {this.state.showForm ? this.renderUpdatePass() : ''}
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.props.auth.hasPass ? this.renderHasPass() : ''} 
            </div>
        );
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ updatePassword }, dispatch);
}

function mapStateToProps(state) {
    return { auth: state.auth };
}

function validate({oldPassword, newPassword, newPassword2}) {
    const errors = {};
    
    if (!oldPassword) {
        errors.oldPassword = 'Please enter current password';
    }
    if (!newPassword) {
        errors.newPassword = 'Please enter new password';
    }
    if (!newPassword2) {
        errors.newPassword2 = 'Please enter password confirmation';
    } else if (newPassword2.length < 8) {
        errors.newPassword2 = 'Password must be atleast 8 characters long';
    }else if (newPassword !== newPassword2) {
        errors.newPassword2 = 'Passwords don\'t match';
    }else if (oldPassword === newPassword2) {
        errors.newPassword2 = 'current and new passwords are the same';
    } 
    
    return errors;
}

export default reduxForm({
    form: 'update-pass',
    fields: ['oldPassword', 'newPassword', 'newPassword2'],
    validate
},mapStateToProps, mapDispatchToProps)(UpdatePassForm);