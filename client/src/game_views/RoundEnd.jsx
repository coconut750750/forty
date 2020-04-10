import React, { Component } from 'react';

import PlayerName from 'components/PlayerName';
import RoundResults from 'components/RoundResults';
import ExitButton from 'components/ExitButton';

import Results from 'models/results';

import { newPlayer } from 'utils/player_utils';

class RoundEnd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: undefined,
    };
  }

  componentDidMount() {
    this.props.socket.on('results', data => {
      const defenders = data.defenders.map(p => newPlayer(p));
      const challengers = data.challengers.map(p => newPlayer(p));
      const results = new Results(data.points, defenders, data.defenseLevel, challengers, data.challengeLevel, data.gameOver);
      this.setState({ results });
    });

    this.props.socket.emit('getResults', {});
    this.props.socket.emit('getKitty', {});
    this.props.socket.emit('getPlay', {});
  }

  render() {
    return (
      <div>
        <h5>Round End</h5>

        {this.props.children}

        <PlayerName player={this.props.mePlayer} />
        <br/>

        <RoundResults
          results={this.state.results}/>

        {this.state.results !== undefined && this.state.results.gameOver ? 
        <button type="button" className="btn btn-light" 
          onClick={ () => this.props.socket.emit('startGame', {}) }>Start New Game</button>
          :
        <button type="button" className="btn btn-light" 
          onClick={ () => this.props.socket.emit('startRound', {}) }>Start Next Round</button>
        }
        <br/>
        <br/>

        <ExitButton
          mePlayer={this.props.mePlayer}
          exitGame={ () => this.props.exitGame() }/>
      </div>
    );
  }
}

export default RoundEnd;
