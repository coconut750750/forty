import React, { Component } from 'react';

class PlayerList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="d-flex justify-content-center">
        {this.props.players.map( player => (
          player.active ? 
          <div class="badge badge-secondary badge-dark m-3">{ player.name }</div> :
          <div class="badge badge-secondary badge-light m-3">{ player.name }</div>
        ))}
      </div>
    );
  }
}

export default PlayerList;
