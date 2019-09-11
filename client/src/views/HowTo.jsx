import React, { Component } from 'react';

class HowTo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>HowTo</p>

        <button type="button" className="btn btn-light" onClick={this.props.goBack}>Back</button>

      </div>
    );
  }
}

export default HowTo;
