import React, { Component } from 'react';

class GameCode extends Component {
  render() {
    return (
      <p>Game code: <span id="gamecode" className="badge badge-secondary badge-light">{this.props.gameCode}</span></p>
    );
  }
}

export default GameCode;
