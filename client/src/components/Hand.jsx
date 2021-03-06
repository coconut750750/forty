import React, { Component } from 'react';

import PlayerName from 'components/PlayerName';
import CardGroup from 'components/CardGroup';

class Hand extends Component {
  render() {
    return (
      <div className={this.props.className}>
        {this.props.player && [<PlayerName player={this.props.player}/>, <br/>]}
        
        <CardGroup
          isActive={this.props.isActive}
          cards={this.props.cards}
          click={ c => this.props.click(c) }
        />
      </div>
    );
  }
}

export default Hand;
