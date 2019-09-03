import React, { Component } from 'react';

class PlayerName extends Component {
  render() {
    var badgeColor = this.props.player.active ? "badge-dark" : "badge-light";
    badgeColor = this.props.player.winner ? "badge-success" : badgeColor;
    return (
      <div className={`badge badge-secondary m-2 ${badgeColor}`}>{ this.props.player.name }</div>
    );
  }
}

export default PlayerName;
