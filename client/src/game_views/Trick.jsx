import React, { Component } from 'react';

import Hand from 'components/Hand';

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

    this.props.socket.emit('getTrick', {});
    this.props.socket.emit('getPlay', {});
  }

  play(card) {
    this.props.socket.emit('playCard', { card: card.json() });
    this.setState({ playActive: false });
  }

  render() {
    return (
      <div>
        <h5>Playing tricks</h5>

        {this.props.children}

        <Hand
          isActive
          player={this.props.mePlayer}
          cards={this.props.hand}
          click={ c => this.play(c) }/>

      </div>
    );
  }
}

export default Tricks;
