import React, { Component } from 'react';

class RoundSummary extends Component {
  click() {
    this.props.socket.emit('startRound', {});
    this.props.click();
  }

  render() {
    return (
      <div>
        <p>Round Summary</p>

        <button type="button" className="btn btn-light" 
          onClick={ () => this.click() }>Start Next Round</button>
      </div>
    );
  }
}

export default RoundSummary;
