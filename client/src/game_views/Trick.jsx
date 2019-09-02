import React, { Component } from 'react';

import Hand from 'components/Hand';
import GameCircle from 'components/GameCircle';

class Tricks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playActive: false,
    };
  }

  componentDidMount() {
    this.props.socket.on('action', data => {
      this.setState({ playActive: true });
      this.props.socket.emit('getHand', {});
    });
  }

  play(card) {
    this.props.socket.emit('playCard', { card: card.json() });
    this.setState({ playActive: false });
  }

  render() {
    const nPlayers = this.props.players.length;
    const mePlayer = this.props.players[this.props.meIndex];
    const rightPlayer = this.props.players[(this.props.meIndex + 1) % nPlayers];
    const acrossPlayer = this.props.players[(this.props.meIndex + 2) % nPlayers];
    const leftPlayer = this.props.players[(this.props.meIndex + 3) % nPlayers];

    return (
      <div>
        <p>Playing cards</p>

        <GameCircle
          acrossPlayer={acrossPlayer}
          acrossCard={this.props.cardsOnTable[acrossPlayer.name]}
          leftPlayer={leftPlayer}
          leftCard={this.props.cardsOnTable[leftPlayer.name]}
          rightPlayer={rightPlayer}
          rightCard={this.props.cardsOnTable[rightPlayer.name]}
          meCard={this.props.cardsOnTable[mePlayer.name]}/>

        <Hand
          player={mePlayer}
          cards={this.props.hand}
          click={ c => this.play(c) }/>

      </div>
    );
  }
}

export default Tricks;
