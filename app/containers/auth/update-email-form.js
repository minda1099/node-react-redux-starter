import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';

import { updateEmail, clearUserStatus } from '../../actions';

class UpdateEmailForm extends Component {
  static contextTypes = {
    updateEmail: PropTypes.func,
    clearUserStatus: PropTypes.func,
    fields: PropTypes.object,
    auth: PropTypes.object,
  };
  constructor(props){
    super(props);
  }
  componentWillMount() {
    this.props.clearUserStatus();
  }
  onChange() {
    this.props.clearUserStatus();
    const { newEmail, password } = this.props.fields;
    this.props.errorHanlder([((newEmail.error) ? newEmail.error : null), (password.error ? password.error : null)]);
  }
  onSubmit(props){
    const { newEmail, password } = this.props.fields;
    this.props.updateEmail(newEmail.value, password.value);
  }
  renderConfirmPass(){
    const { fields: { password }, auth } = this.props;
    return (
      <div>
        <fieldset className={`form-group ${password.touched && password.invalid ? 'has-danger' : ''}`}>
          <label> Confirm Password </label>
          <input type="password" className="form-control" {...password}/>
        </fieldset>
        <div className="btn-toolbar">
          <button type="submit" className={`btn btn-primary ${auth.isUpdating ? 'disabled' : ''}` }> {auth.isUpdating ? 'loading...' : 'Save'} </button>
        </div>
      </div>
    );
  }
  render() {
    const { fields: { newEmail }, handleSubmit, auth } = this.props;
    return (
      <form
        className="m-a-1"
        onChange={this.onChange.bind(this)} 
        onBlur={this.onChange.bind(this)} 
        onSubmit={handleSubmit(this.onSubmit.bind(this))}
      >
        <fieldset className={`form-group ${newEmail.touched && newEmail.invalid ? 'has-danger' : ''}`}>
          <label> Update Email </label>
          <input type="email" className="form-control" disabled={auth.hasPass ? '' : 'disabled'} {...newEmail} />
        </fieldset>
          {(newEmail.touched || newEmail.active) && auth.hasPass ? this.renderConfirmPass() : ''}
      </form>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ 
    updateEmail, 
    clearUserStatus,
  }, dispatch);
};

const mapStateToProps = ({auth}) => {
  return { 
    initialValues: {
      newEmail: auth.email,
    },
    auth,
  };
};

const validate =({newEmail, password}) => {
  const errors = {};
  if (!newEmail) {
    errors.newEmail = 'Enter an email address';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newEmail)) {
    errors.newEmail = 'Invalid email address';
  }
  if(!password){
    errors.password = 'Enter a password';
  } else if (password.length < 8) {
    errors.password = 'Password must be atleast 8 characters long';
  }
  return errors;
};

export default reduxForm({
  form: 'update-email',
  fields: ['newEmail', 'password'],
  validate
}, mapStateToProps, mapDispatchToProps)(UpdateEmailForm);
