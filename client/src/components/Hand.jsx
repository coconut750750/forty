import React, { Component } from 'react';

class Hand extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="hand hhand-compact active-hand">
        {this.props.cards.map(c => (
          <img className='playing-card' src={`cards/${c.rank}${c.suit}.svg`}/>
          ))}
      </div>
    );
  }
}

export default Hand;

// <div class="hand hhand-compact active-hand">
//         <img class='playing-card' src='cards/AS.svg'>
//         <img class='playing-card' src='cards/KS.svg'>
//         <img class='playing-card' src='cards/QS.svg'>
//         <img class='playing-card' src='cards/JS.svg'>
//         <img class='playing-card' src='cards/10S.svg'>
//         <img class='playing-card' src='cards/9H.svg'>
//         <img class='playing-card' src='cards/3H.svg'>
//     </div>