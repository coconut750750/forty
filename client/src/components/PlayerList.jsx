import React, { Component } from 'react';

import PlayerName from 'components/PlayerName';

class PlayerList extends Component {
  render() {
    return (
      <div className="d-flex justify-content-center">
        {this.props.players.map( player => <PlayerName player={player}/> )}
      </div>
    );
  }
}

export default PlayerList;
