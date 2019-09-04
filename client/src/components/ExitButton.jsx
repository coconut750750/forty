import React, { Component } from 'react';

class ExitButton extends Component {
  render() {
    if (this.props.mePlayer === undefined) {
      return <button type="button" className="btn btn-light" onClick={ () => this.props.exitGame() }>Exit</button>;
    }

    const text = this.props.mePlayer.isAdmin ? "End Game" : "Leave Game";

    return <button type="button" className="btn btn-light" onClick={ () => this.props.exitGame() }>{text}</button>;
  }
}

export default ExitButton;
