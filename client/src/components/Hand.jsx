import React, { Component } from 'react';

import PlayerName from 'components/PlayerName';

class Hand extends Component {
  render() {
    return (
      <div>
        {this.props.player && <PlayerName player={this.props.player} />}
        <br/>
        <div className="hand hhand-compact active-hand">
          {this.props.cards && this.props.cards.map(c => (
            <img
              className={`playing-card ${c.highlight ? "highlight" : ""}`}
              alt={`${c.rank}${c.suit}`}
              src={`cards/${c.rank}${c.suit}.svg`}
              onClick={ () => {
                if (c.highlight) {
                  this.props.click(c);
                }
              }}/>
            ))}
        </div>
      </div>
    );
  }
}

export default Hand;
