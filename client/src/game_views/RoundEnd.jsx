import React, { Component } from 'react';

import PlayerName from 'components/PlayerName';
import RoundResults from 'components/RoundResults';

class RoundEnd extends Component {
  componentDidMount() {
    this.props.socket.emit('getResults', {});
  }

  render() {
    return (
      <div>
        <p>Round End</p>

        {this.props.children}

        <PlayerName player={this.props.mePlayer} />
        <br/>

        <RoundResults
          results={this.props.results}/>

        <button type="button" className="btn btn-light" 
          onClick={ () => this.props.socket.emit('startRound', {}) }>Start Next Round</button>
        <br/>
      </div>
    );
  }
}

export default RoundEnd;
