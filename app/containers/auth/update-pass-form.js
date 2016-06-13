import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import { updatePassword, clearUserStatus } from '../../actions';

class UpdatePassForm extends Component {
  static contextTypes = {
    updatePassword: PropTypes.func,
    clearUserStatus: PropTypes.func,
    fields: PropTypes.object,
    auth: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
    };
  }
  componentWillMount() {
    this.props.clearUserStatus();
    if(this.props.auth.status){
      this.setState({
        showForm: false,
      });
    }
  }
  onChange() {
    this.props.clearUserStatus();
    const { oldPassword, newPassword, newPassword2 } = this.props.fields;
    this.props.errorHanlder([(oldPassword.error ? oldPassword.error : null), (newPassword2.error ? newPassword2.error : null), (newPassword.error ? newPassword.error : null)]);
  }
  toggleForm() {
    this.setState({
      showForm: this.state.showForm ? false : true,
    });
  }
  onSubmit(props){
    this.props.clearUserStatus();
    const { oldPassword, newPassword } = this.props.fields;
    this.props.updatePassword(oldPassword.value, newPassword.value);
  }
  renderUpdatePass(){
    const { fields: { oldPassword, newPassword, newPassword2 }, handleSubmit, auth } = this.props;
    return (
      <form 
        onChange={this.onChange.bind(this)} 
        onBlur={this.onChange.bind(this)} 
        onSubmit={handleSubmit(this.onSubmit.bind(this))}
      >
        <div className={`form-group ${oldPassword.touched && oldPassword.invalid ? 'has-danger' : ''}`}>
          <label> Current Password </label>
          <input type="password" className="form-control"  {...oldPassword} />
        </div>
        <div className={`form-group ${newPassword.touched && newPassword.invalid ? 'has-danger' : ''}`}>
          <label> New Password </label>
          <input type="password" className="form-control" {...newPassword}/>
        </div>
        <div className={`form-group ${newPassword2.touched && newPassword2.invalid ? 'has-danger' : ''}`}>
          <label> New Password Confirm </label>
          <input type="password" className="form-control" {...newPassword2}/>
        </div>
        <div className="btn-toolbar">
          <button type="submit" className={`btn btn-success ${auth.isUpdating ? 'disabled' : ''}` }> {auth.isUpdating ? 'loading...' : 'Save'} </button>
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
      <div className="m-a-1">
        {this.props.auth.hasPass ? this.renderHasPass() : ''} 
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ 
    updatePassword,
    clearUserStatus,
  }, dispatch);
};

const mapStateToProps = ({auth}) => {
  return { 
    auth,
  };
};

const validate = ({oldPassword, newPassword, newPassword2}) => {
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
  } else if (newPassword !== newPassword2) {
    errors.newPassword2 = 'Passwords don\'t match';
  } else if (oldPassword === newPassword2) {
    errors.newPassword2 = 'current and new passwords are the same';
  }
  return errors;
};

export default reduxForm({
  form: 'update-pass',
  fields: ['oldPassword', 'newPassword', 'newPassword2'],
  validate,
},mapStateToProps, mapDispatchToProps)(UpdatePassForm);