import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { logoutAndRedirect } from '../actions';

import NavBar  from './nav-bar';

class Main extends Component {
    constructor(props) {
        super(props);

    }
    render() {

        return (
            <div>
                <NavBar />
                <div className="container">
                    <div className="row">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        logoutAndRedirect
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        auth: state.auth
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
