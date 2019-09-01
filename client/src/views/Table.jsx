import React, { Component } from 'react';

import GameCode from 'components/GameCode';
import PlayerList from 'components/PlayerList';

import Teams from 'game_views/Teams';

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      phase: undefined,
    };
  }

  componentDidMount() {
    this.props.socket.on('players', data => {
      this.setState({ players: data.players });
    });
    this.props.socket.on('phase', data => {
      this.setState({ phase: data.phase });
    });
    this.props.socket.emit('getPlayers', {});
    this.props.socket.emit('getPhase', {});
  }

  render() {
    const game_views = {
      teams: <Teams 
                players={this.state.players}
                socket={this.props.socket}/>
    }
    return (
      <div>
        <p>Table</p>
        <GameCode gameCode={this.props.gameCode}/>
        <PlayerList players={this.state.players}/>

        <br/>

        {game_views[this.state.phase]}

        <br/>
      </div>
    );
  }
}

export default Table;
