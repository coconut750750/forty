import React, { Component } from 'react';

import GameCode from 'components/GameCode';
import PlayerList from 'components/PlayerList';

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
    };
  }

  componentDidMount() {
    this.props.socket.on('players', data => {
      this.setState({ players: data.players });
    });
    this.props.socket.emit('getPlayers', {});
  }

  render() {
    return (
      <div>
        <p>Table</p>
        <GameCode gameCode={this.props.gameCode}/>

        <br/>

        <PlayerList players={this.state.players}/>

        <br/>
      </div>
    );
  }
}

export default Table;
