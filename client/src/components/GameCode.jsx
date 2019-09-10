import React, { Component } from 'react';

const style = {
    boxShadow: "0px 0px 5px 0px #21252999",
}

class GameCode extends Component {
  render() {
    return (
      <p>Game code: <span className="badge badge-secondary badge-light" style={style}>{this.props.gameCode}</span></p>
    );
  }
}

export default GameCode;
