import React, { Component } from 'react';

class CardGroup extends Component {
  render() {
    return (
      <div className={`hand hhand-compact ${this.props.isActive ? "active-hand" : ""}`}>
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
    );
  }
}

export default CardGroup;
