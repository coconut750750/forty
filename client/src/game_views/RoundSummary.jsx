import React, { Component } from 'react';

import PlayerName from 'components/PlayerName';

class RoundSummary extends Component {
  render() {
    return (
      <div>
        <p>Round Summary</p>

        {this.props.children}

        <PlayerName player={this.props.mePlayer} />
        <br/>

        <button type="button" className="btn btn-light" 
          onClick={ () => this.props.socket.emit('startRound', {}) }>Start Next Round</button>
        <br/>
      </div>
    );
  }
}

export default RoundSummary;
