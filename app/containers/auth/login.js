import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';

import { loginUser, fbLogin, gLogin, clearUserStatus } from '../../actions';
import StatusHandler from './status-handler';

class Login extends Component {
  static contextTypes = {
    loginUser: PropTypes.func,
    fbLogin: PropTypes.func,
    gLogin: PropTypes.func,
    clearUserStatus: PropTypes.func,
    fields: PropTypes.object,
    handleSubmit: PropTypes.func,
    auth: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = { error: '' };
  }
  componentWillMount() {
    this.props.clearUserStatus();
  }
  onSubmit(props) {
    const { email, password } = this.props.fields;
    this.props.loginUser(email.value, password.value);
  }
  onKeyPress(event) {
    this.props.clearUserStatus();
    if (event.which == 13 || event.keyCode == 13) { // Enter
      this.onSubmit(this.props);
    }
  }
  render() {
    const { fields: { email, password }, handleSubmit, auth } = this.props;
    return (
      <div className="col-md-8 offset-md-2 col-sm-12">
        <form className="m-a-1">
          <h2 className="text-xs-center"> LOGIN </h2>
          <fieldset className={`form-group ${email.touched && email.invalid ? 'has-danger' : ''}`}>
            <label> Email </label>
            <input onKeyPress={this.onKeyPress.bind(this)} type="email" className="form-control" {...email} />
          </fieldset>
          <fieldset className={`form-group ${password.touched && password.invalid ? 'has-danger' : ''}`}>
            <label> Password </label>
            <input onKeyPress={this.onKeyPress.bind(this)} type="password" className="form-control" { ...password }/>
          </fieldset>
        </form>
        <StatusHandler errors={[(email.error && email.touched ? email.error : null), (password.error && password.touched ? password.error : null)]} /> 
        <hr/>
        <button
          onClick={handleSubmit(this.onSubmit.bind(this))} 
          className={`btn btn-success btn-auth ${auth.isUpdating ? 'disabled' : ''}` }
        > 
          {auth.isUpdating ? 'Loading...' : 'Login'}
        </button>
        <GoogleLogin
          clientId={'658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com'}
          callback={this.props.gLogin}
          offline={true}
          cssClass={`btn btn-danger btn-auth ${auth.isUpdating ? 'disabled' : ''}`}
          buttonText="Google"
        />
        <FacebookLogin
          appId="1559504071030678"
          autoLoad={false}
          callback={this.props.fbLogin}
          cssClass={`btn btn-primary btn-auth ${auth.isUpdating ? 'disabled' : ''}`}
          textButton="Facebook"
          fields={'email'}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ 
    loginUser, 
    fbLogin, 
    gLogin,
    clearUserStatus,
  }, dispatch);
};

const mapStateToProps = (state) => {
  return { 
    auth: state.auth,
  };
};

function validate({ email, password, }) {
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
  fields: ['email', 'password',],
  validate,
}, mapStateToProps, mapDispatchToProps)(Login);
