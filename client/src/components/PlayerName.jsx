import React, { Component } from 'react';

class PlayerName extends Component {
  getBadgeClass() {
    console.log(this.props.player, this.props.player.isDefending());
    if (!this.props.player.active) {
      return "badge-light";
    } else if (this.props.player.team !== undefined) {
      return this.props.player.isDefending() ? "badge-primary" : "badge-secondary";
    } else {
      return "badge-dark";
    }
  }

  getStyle() {
    if (this.props.player.winner) {
      return { boxShadow: "0px 0px 4px 2px green" };
    }
    return {};
  }

  render() {
    return (
      <div
        className={`badge m-2 ${this.getBadgeClass()}`}
        style={this.getStyle()}>{ this.props.player.name }</div>
    );
  }
}

export default PlayerName;
