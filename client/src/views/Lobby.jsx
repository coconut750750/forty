import React, { Component } from 'react';

import GameCode from 'components/GameCode';
import PlayerList from 'components/PlayerList';

import './Lobby.css';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      message: undefined,
    };
  }

  componentDidMount() {
    this.props.socket.emit('join', { name: this.props.name, gameCode: this.props.gameCode });
    this.props.socket.on('players', data => {
      this.setState({ players: data.players });
    });

    this.props.socket.on('startFail', data => {
      this.setState({ message: data.message });
    });

    this.props.socket.on('endGame', data => {
      this.leaveGame();
    });
  }

  leaveGame() {
    this.props.socket.disconnect();
    this.props.endGame();
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

        <button type="button" className="btn btn-light" onClick={ () => this.leaveGame() }>Leave Game</button>
        <button type="button" className="btn btn-light" onClick={ () => this.props.socket.emit('start') }>Start Game</button>

        <br/>
        {this.state.message && <div class="alert alert-danger" role="alert">
          {this.state.message}
        </div>}
      </div>
    );
  }
}

export default Lobby;
