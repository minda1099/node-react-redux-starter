import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import { addPassword, clearUserFailure, clearUserStatus } from '../../actions';

class AddPassForm extends Component {
  static contextTypes = {
    addPassword: PropTypes.func,
    clearUserStatus: PropTypes.func,
    fields: PropTypes.object,
    auth: PropTypes.object,
  };
  constructor(props){
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      showForm: false,
    };
  }
  onChange() {
    this.props.clearUserStatus();
    const { newPassword, newPassword2 } = this.props.fields;
    this.props.errorHanlder([(newPassword2.error ? newPassword2.error : null), (newPassword.error ? newPassword.error : null)]);
  }
  toggleForm(){
    this.setState({
      showForm: this.state.showForm ? false : true,
    });
  }
  onSubmit(props){
    this.props.addPassword(this.props.fields.newPassword.value);
  }
  renderAddPass(){
    const { fields: { newPassword, newPassword2 }, handleSubmit, auth } = this.props;
    return (
      <form 
        onChange={this.onChange} 
        onBlur={this.onChange} 
        onSubmit={handleSubmit(this.onSubmit)}
      >
        <fieldset className={`form-group ${newPassword.touched && newPassword.invalid ? 'has-danger' : ''}`}>
          <label> New Password </label>
          <input type="password" className="form-control" {...newPassword}/>
        </fieldset>
        <fieldset className={`form-group ${newPassword2.touched && newPassword2.invalid ? 'has-danger' : ''}`}>
          <label> New Password Confirm </label>
          <input type="password" className="form-control" {...newPassword2}/>
        </fieldset>
        <div className="btn-toolbar">
          <button type="submit" className={`btn btn-primary ${auth.isUpdating ? 'disabled' : ''}` }> {auth.isUpdating ? 'loading...' : 'Save'} </button>
        </div>
      </form>
    );
  }
  render() {
    return (
      <div className="m-a-1">
        { this.props.auth.get('hasPass') ? '' : this.renderAddPass() }
      </div>
    );
  }
}
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ 
    addPassword,
    clearUserStatus,
  }, dispatch);
};
const mapStateToProps = (state) => {
  return { auth: state.auth };
};
const validate = ({newPassword, newPassword2}) => {
  const errors = {};
  if (!newPassword) {
    errors.newPassword = 'Please enter new password';
  }
  if (!newPassword2) {
    errors.newPassword2 = 'Please enter password confirmation';
  } else if (newPassword2.length < 8) {
    errors.newPassword2 = 'Password must be atleast 8 characters long';
  }else if (newPassword !== newPassword2) {
    errors.newPassword2 = 'Passwords don\'t match';
  } 
  return errors;
}
export default reduxForm({
  form: 'add-pass',
  fields: ['newPassword', 'newPassword2'],
  validate
}, mapStateToProps, mapDispatchToProps)(AddPassForm);
