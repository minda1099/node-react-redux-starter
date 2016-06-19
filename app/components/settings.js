import React, { Component } from 'react';

import { UpdateEmailForm, UpdatePassForm, FbSettings, GoogSettings, AddPassForm, StatusHandler} from '../containers';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.handleErrors = this.handleErrors.bind(this);
    this.state ={
      errors: [],
    };
  }
  handleErrors(errors) {
    this.setState({
      errors,
    });
  }
  render() {
    return (
      <div className="col-md-6 offset-md-3 col-sm-12">
        <div className="m-a-1">
        <h2>User Settings</h2>
        <UpdateEmailForm  
          errorHanlder={this.handleErrors}
        />
        <UpdatePassForm 
          errorHanlder={this.handleErrors}
        />
        <FbSettings />
        <GoogSettings />
        <AddPassForm 
          errorHanlder={this.handleErrors}
        />
        <StatusHandler errors={this.state.errors} />
        </div>
      </div>
    );
  }
}

export default Settings;
