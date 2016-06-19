import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class statusHandler extends Component {
  static contextTypes = {
    auth:PropTypes.object,
    errors:PropTypes.array,
  };
  constructor(props){
    super(props);
  }
  render() {
    const { auth, errors } = this.props;
    const statusText = auth.get('statusText');
    const success = auth.get('success');
    if (success) {
      return (
        <div className='alert alert-success m-a-1'>
          {statusText} 
        </div>
      );
    } else if (success === false) {
      return (
        <div className='alert alert-danger m-a-1'>
          {statusText} 
        </div>
      );
    } else if (errors) {
      const errorsLength = errors.length;
      for(let i = 0; i < errorsLength; i++) {
        const error = errors[i];
        if(error){
          return (
            <div className='alert alert-danger m-a-1'>
              {error}
            </div>
          );
        }
      }
      return (<div/>);
    }
    return (<div/>);
  }
}

const mapStateToProps = (state) => {
  return { auth: state.auth };
};

export default connect(mapStateToProps)(statusHandler);
