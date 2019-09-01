import React, { Component } from 'react';

class PlayerList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>Players</p>
        <div className="d-flex justify-content-center">
          {this.props.players.map( player => (
            <div class="badge badge-secondary badge-dark m-3">{ player.name }</div>
          ))}
        </div>
      </div>
    );
  }
}

export default PlayerList;
