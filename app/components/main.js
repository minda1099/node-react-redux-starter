import React, { Component } from 'react';

import NavBar from './nav_bar';

export default class Main extends Component {
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