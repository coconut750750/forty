import React, { Component } from 'react';

class PlayerName extends Component {
  render() {
    const className = this.props.player.active ? "badge badge-secondary badge-dark m-2" : "badge badge-secondary badge-light m-3";
    return (
      <div className={className}>{ this.props.player.name }</div>
    );
  }
}

export default PlayerName;
