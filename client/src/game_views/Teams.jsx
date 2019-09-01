import React, { Component } from 'react';

import PlayerList from 'components/PlayerList';

class Teams extends Component {
  getTeams(players) {
    return {
      team1: players.filter((element, index) => index % 2 === 0),
      team2: players.filter((element, index) => index % 2 === 1)
    }
  }

  render() {
    const { team1, team2 } = this.getTeams(this.props.players);

    return (
      <div>
        <p>Choose teams</p>

        <br/>

        <PlayerList players={team1}/>
        <p>vs.</p>
        <PlayerList players={team2}/>

        <button type="button" className="btn btn-light" onClick={ () => this.props.socket.emit('permutePlayers', {}) }>Change Teams</button>
        <button type="button" className="btn btn-light" onClick={ () => this.props.socket.emit('confirmTeams', {}) }>Confirm</button>
      </div>
    );
  }
}

export default Teams;
