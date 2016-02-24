import React, { Component } from 'react';

import { UpdateEmailForm, UpdatePassForm } from '../containers';
class Settings extends Component {

    constructor(props){
        super(props);
    }

    render() {
        return (
            <div>
                <h2> User Settings </h2>
                <UpdateEmailForm />
                <UpdatePassForm />
            </div>
        );
    }
}



export default Settings;