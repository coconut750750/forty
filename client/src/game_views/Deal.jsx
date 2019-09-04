import React, { Component } from 'react';

import Hand from 'components/Hand';

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
    return (
      <div>
        <p>Dealing cards</p>

        {this.props.children}

        <Hand
          isActive
          player={this.props.mePlayer}
          cards={this.props.hand}
          click={ c => this.props.socket.emit('setTrump', { suit: c.suit }) }/>

        {this.props.trumpMissing && this.props.mePlayer.isAdmin ? 
          <button type="button" className="btn btn-light" 
            onClick={ () => this.props.socket.emit('setTrumpFromKitty', {}) }>Force Trump</button>
          :
          <button type="button" className="btn btn-light" 
            onClick={ () => this.draw() }
            disabled={!this.state.dealActive}>Draw</button>
        }
        <br/>

      </div>
    );
  }
}

export default Deal;
