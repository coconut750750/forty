import React, { Component } from 'react';
import io from 'socket.io-client';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
    };

    this.socket = io('http://localhost:5000/lobby');
  }

  componentDidMount() {
    this.socket.on('connect', () => {
      this.socket.emit('join', { name: this.props.name, gameCode: this.props.gameCode });
      this.socket.on('updateLobby', data => {
        this.setState({ players: data.players });
      });

      this.socket.on('endGame', data => {
        this.leaveGame();
      })
    });
  }

  leaveGame() {
    this.socket.disconnect();
    this.props.onEnd();
  }

  render() {
    return (
      <div>
        <p>Lobby</p>
        <p>Game code: {this.props.gameCode}</p>
        
        <br/>

        <p>Players</p>
        <div className="d-flex justify-content-center">
          <div className="col-3 p-3">
            {this.state.players[0] || ""}
          </div>
          <div className="col-3 p-3">
            {this.state.players[1] || ""}
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <div className="col-3 p-3">
            {this.state.players[2] || ""}
          </div>
          <div className="col-3 p-3">
            {this.state.players[3] || ""}
          </div>
        </div>

        <br/>

        <button type="button" className="btn btn-light" onClick={ () => this.leaveGame() }>Leave Game</button>
        <button type="button" className="btn btn-light" onClick={undefined}>Start Game</button>

      </div>
    );
  }
}

export default Lobby;
