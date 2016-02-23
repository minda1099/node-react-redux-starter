import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { logoutAndRedirect } from '../actions';


class Nav extends Component {
    constructor(props){
        super(props);
    }

    renderLoggedIn(){
        return (
            <ul className="nav navbar-nav pull-xs-right" >
                <li className="nav-item">
                    <Link to="/settings" className="nav-link" activeClassName="active" >Settings</Link>
                    
                </li>
                <li className="nav-item">
                    <span onClick={() => {this.props.logoutAndRedirect()}} className="nav-link" >Log Out</span>
                </li>
            </ul>
        );
    }
    renderLoggedOut(){
        return (
            <ul className="nav navbar-nav pull-xs-right" >
                <li className="nav-item">
                    <Link to="/register" className="nav-link" activeClassName="active" >Register</Link>
                </li>
                <li className="nav-item">
                    <Link to="/login" className="nav-link" activeClassName="active" >Login</Link>
                </li>
            </ul>
        );
    }
    
    render(){
        return (
            <nav className="navbar navbar-dark bg-primary">
                <Link to="/" className="navbar-brand" >Node Redux Starter</Link>
                
                    { this.props.auth.isAuthenticated ? this.renderLoggedIn() : this.renderLoggedOut() }
                
            </nav>
        );
    }
    
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({logoutAndRedirect}, dispatch);
}

function mapStateToProps(state) {
    return {
        auth: state.auth
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav);