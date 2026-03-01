import React, { Component } from 'react';

import Hand from 'components/Hand';

class Deal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h5>Dealing cards</h5>

        {this.props.children}

        <Hand
          isActive
          player={this.props.mePlayer}
          cards={this.props.hand}
          click={ (c, index) => this.props.socket.emit('setTrump', { indexes: [index] }) }/>

        {this.props.trumpNeeded && this.props.mePlayer.isAdmin &&
          <button type="button" className="btn btn-light" 
            onClick={ () => this.props.socket.emit('setTrumpFromKitty', {}) }>Force Trump</button>
        }
        <br/>

      </div>
    );
  }
}

export default Deal;
