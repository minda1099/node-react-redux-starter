import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Nav extends Component {
    render(){
        return (
            <nav className="navbar navbar-dark bg-primary">
                <Link to="/" className="navbar-brand" >Node Redux Starter</Link>
            </nav>
        );
    }
    
}