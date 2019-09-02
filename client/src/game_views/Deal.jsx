import React, { Component } from 'react';

import Hand from 'components/Hand';
import GameCircle from 'components/GameCircle';

class Deal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dealActive: false,
    };
  }

  componentDidMount() {
    this.props.socket.on('action', data => {
      this.setState({ dealActive: true });
    });
  }

  draw() {
    this.props.socket.emit('draw', {});
    this.setState({ dealActive: false });
  }

  render() {
    const nPlayers = this.props.players.length;
    const mePlayer = this.props.players[this.props.meIndex];
    const rightPlayer = this.props.players[(this.props.meIndex + 1) % nPlayers];
    const acrossPlayer = this.props.players[(this.props.meIndex + 2) % nPlayers];
    const leftPlayer = this.props.players[(this.props.meIndex + 3) % nPlayers];

    return (
      <div>
        <p>Dealing cards</p>

        <GameCircle
          acrossPlayer={acrossPlayer}
          acrossCard={this.props.trumpSetter === acrossPlayer.name ? this.props.trumpCard : undefined}
          leftPlayer={leftPlayer}
          leftCard={this.props.trumpSetter === leftPlayer.name ? this.props.trumpCard  : undefined}
          rightPlayer={rightPlayer}
          rightCard={this.props.trumpSetter === rightPlayer.name ? this.props.trumpCard  : undefined}/>

        <Hand
          player={mePlayer}
          cards={this.props.hand}
          click={ c => this.props.socket.emit('setTrump', { suit: c.suit }) }/>

        <button type="button" className="btn btn-light" 
          onClick={ () => this.draw() }
          disabled={!this.state.dealActive}>Draw</button>
        <br/>

      </div>
    );
  }
}

export default Deal;
