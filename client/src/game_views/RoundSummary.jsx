import React, { Component } from 'react';

class RoundSummary extends Component {
  render() {
    return (
      <div>
        <p>Round Summary</p>

        <button type="button" className="btn btn-light" 
          onClick={ () => this.props.socket.emit('startRound', {}) }>Start Next Round</button>
      </div>
    );
  }
}

export default RoundSummary;
