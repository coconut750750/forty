import React, { Component } from 'react';

class HowTo extends Component {
  render() {
    return (
      <div>
        <p>Coming Soon!</p>

        <button type="button" className="btn btn-light" onClick={this.props.goBack}>Back</button>

      </div>
    );
  }
}

export default HowTo;
