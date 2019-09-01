import React, { Component } from 'react';

class GameCode extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <p>Game code: <span id="gamecode" class="badge badge-secondary badge-light">{this.props.gameCode}</span></p>
    );
  }
}

export default GameCode;
