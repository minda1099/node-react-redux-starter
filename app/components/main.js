import React, { Component } from 'react';

export default class Main extends Component {
  render() {
    return (
        <div>
            Hello World!
            {this.props.children}
        </div>
    );
  }
}