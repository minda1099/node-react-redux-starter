import React, { Component } from 'react';

import { UpdateEmailForm, UpdatePassForm, FbSettings, GoogSettings, AddPassForm } from '../containers';
class Settings extends Component {

    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="col-md-6 offset-md-3 col-sm-12 margin-top-50 ">
                <h2> User Settings </h2>
                <UpdateEmailForm />
                <UpdatePassForm />
                <div className="btn-toolbar container margin-vert-30">
                    <FbSettings />
                    <GoogSettings />
                </div>
                <AddPassForm />
            </div>
        );
    }
}



export default Settings;