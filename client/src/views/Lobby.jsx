import React, { Component } from 'react';
import io from 'socket.io-client';

import './Lobby.css';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
    };
  }

  componentDidMount() {
    this.props.socket.emit('join', { name: this.props.name, gameCode: this.props.gameCode });
    this.props.socket.on('updateLobby', data => {
      this.setState({ players: data.players });
    });

    this.props.socket.on('endGame', data => {
      this.leaveGame();
    })
  }

  leaveGame() {
    this.props.socket.disconnect();
    this.props.onEnd();
  }

  render() {
    return (
      <div>
        <p>Lobby</p>
        <p>Game code: <span id="gamecode" class="badge badge-secondary badge-light">{this.props.gameCode}</span></p>
        
        <br/>

        <p>Players</p>
        <div className="d-flex justify-content-center">
          {this.state.players.map( playerName => (
            <div class="badge badge-secondary badge-dark m-3">{ playerName }</div>
          ))}
        </div>

        <br/>

        <button type="button" className="btn btn-light" onClick={ () => this.leaveGame() }>Leave Game</button>
        <button type="button" className="btn btn-light" onClick={undefined}>Start Game</button>

      </div>
    );
  }
}

export default Lobby;
