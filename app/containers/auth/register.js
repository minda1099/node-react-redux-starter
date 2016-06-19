import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';

import { registerUser, fbLogin, gLogin, clearUserStatus } from '../../actions';
import StatusHandler from './status-handler';

class Register extends Component {
  static contextTypes = {
    registerUser: PropTypes.func,
    fbLogin: PropTypes.func,
    gLogin: PropTypes.func,
    clearUserStatus: PropTypes.func,
    fields: PropTypes.object,
    handleSubmit: PropTypes.func,
    auth: PropTypes.object,
  };
  constructor(props){
    super(props);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentWillMount(){
    this.props.clearUserStatus();
  }
  onSubmit(props){
    const { email, password } = this.props.fields;
    this.props.registerUser(email.value, password.value);
  }
  onKeyPress(event){
    this.props.clearUserStatus();
    if (event.which == 13 || event.keyCode == 13) { // Enter
      this.onSubmit(this.props);
    }
  }
  render() {
    const { fields: { email, password, password2 }, handleSubmit, auth } = this.props;
    const isUpdating = auth.get('isUpdating');
    return (
      <div className="col-md-8 offset-md-2 col-sm-12">
        <form className="m-a-1">
          <h2 className="text-xs-center"> REGISTER </h2>
          <fieldset className={ `form-group ${ email.touched && email.invalid ? 'has-danger' : '' }` }>
            <label> Email: </label>
            <input onKeyPress={ this.onKeyPress } type="email" className="form-control" {...email} required autofocus/>
          </fieldset>
          <fieldset className={ `form-group ${ password.touched && password.invalid ? 'has-danger' : '' }` }>
            <label> Password: </label>
            <input onKeyPress={ this.onKeyPress } type="password" className="form-control" {...password} required/>
          </fieldset>
          <fieldset className={ `form-group ${ password2.touched && password2.invalid ? 'has-danger' : '' }` }>
            <label> Confirm Password: </label>
            <input onKeyPress={ this.onKeyPress } type="password" className="form-control" {...password2} required/>
          </fieldset>
        </form>
        <StatusHandler errors={[(email.error && email.touched ? email.error : null), (password.error && password.touched ? password.error : null), (password2.error && password2.touched ? password2.error : null)]} />
        <hr/>
        <button
          onClick={handleSubmit(this.onSubmit)} 
          className={`btn btn-success btn-auth ${isUpdating ? 'disabled' : ''}` }
        > 
          {isUpdating ? 'Loading...' : 'Register'}
        </button>
        <GoogleLogin
          clientId={'658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com'}
          callback={this.props.gLogin}
          offline={true}
          cssClass={`btn btn-danger btn-auth ${isUpdating ? 'disabled' : ''}`}
          buttonText="Google"
        />
        <FacebookLogin
          appId="1559504071030678"
          autoLoad={false}
          callback={this.props.fbLogin}
          cssClass={`btn btn-primary btn-auth ${isUpdating ? 'disabled' : ''}`}
          textButton="Facebook"
          fields={'email'}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    registerUser, 
    fbLogin,
    gLogin,
    clearUserStatus,
  }, dispatch);
};

const mapStateToProps = (state)  =>  {
  return { auth: state.auth };
};

const validate = ({email, password, password2}) => {
  const errors = {};
  if (!email) {
    errors.email = 'Enter an email address';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.email = 'Invalid email address';
  }
  if (!password) {
    errors.password = 'Enter a password';
  } 
  if (!password2) {
    errors.password2 = 'Please enter password confirmation';
  } else if (password2.length < 8) {
    errors.password2 = 'Password must be atleast 8 characters long';
  } else if (password !== password2) {
    errors.password2 = 'Passwords don\'t match';
  }
  
  return errors;
};

export default reduxForm({
  form: 'Register',
  fields: ['email', 'password', 'password2'],
  validate,
}, mapStateToProps, mapDispatchToProps)(Register);
