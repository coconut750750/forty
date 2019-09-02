import React, { Component } from 'react';

class Hand extends Component {
  render() {
    return (
      <div className="hand hhand-compact active-hand">
        {this.props.cards.map(c => (
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
    );
  }
}

export default Hand;
