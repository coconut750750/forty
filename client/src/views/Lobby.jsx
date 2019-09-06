import React, { Component } from 'react';

import GameCode from 'components/GameCode';
import PlayerList from 'components/PlayerList';
import ExitButton from 'components/ExitButton';

import { getMePlayer, newPlayer } from 'utils/player_utils';

import './Lobby.css';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      mePlayer: undefined,
      message: undefined,
    };
  }

  componentDidMount() {
    this.props.socket.emit('join', { name: this.props.name, gameCode: this.props.gameCode });

    this.props.socket.on('players', data => {
      const players = data.players.map(p => newPlayer(p));
      const mePlayer = getMePlayer(players, this.props.name);
      this.setState({ players, mePlayer });
    });

    this.props.socket.on('startFail', data => {
      this.setState({ message: data.message });
    });
  }

  render() {
    return (
      <div>
        <p>Lobby</p>
        <GameCode gameCode={this.props.gameCode}/>
        
        <br/>

        <p>Players</p>
        <PlayerList players={this.state.players}/>

        <br/>

        <ExitButton
          mePlayer={this.state.mePlayer}
          exitGame={ () => this.props.exitGame() }/>
        <button type="button" className="btn btn-light" onClick={ () => this.props.socket.emit('startGame', {}) }>Start Game</button>

        <br/>
        {this.state.message && <div class="alert alert-danger" role="alert">
          {this.state.message}
        </div>}
      </div>
    );
  }
}

export default Lobby;
