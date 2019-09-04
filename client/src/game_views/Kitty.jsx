import React, { Component } from 'react';

import CardGroup from 'components/CardGroup';
import Hand from 'components/Hand';

var _ = require('lodash');

const KITTY_SIZE = 6;

class Kitty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      kittyActive: false,
      kitty: [],
    };
  }

  componentDidMount() {
    this.props.socket.on('action', data => {
      this.setState({ kittyActive: true });
    });
  }

  confirm() {
    this.props.socket.emit('setKitty', { cards: this.state.kitty.map(c => c.json()) });
  }

  getHandWithoutKitty() {
    var hand = _.cloneDeep(this.props.hand);
    _.remove(hand, c => _.findIndex(this.state.kitty, k => c.equals(k)) >= 0);
    if (this.state.kitty.length >= KITTY_SIZE) {
      hand.map(c => {c.highlight = false; return c;});
    } else {
      hand.map(c => {c.highlight = true; return c;});
    }
    return hand;
  }

  addToKitty(c) {
    var kitty = _.cloneDeep(this.state.kitty);
    kitty.push(c);
    this.setState({ kitty });
  }

  removeFromKitty(c) {
    var kitty = _.cloneDeep(this.state.kitty);
    _.remove(kitty, k => c.equals(k));
    this.setState({ kitty });
  }

  renderKitty(mePlayer) {
    if (this.state.kittyActive) {
      return [
        <Hand
          isActive
          player={mePlayer}
          cards={this.getHandWithoutKitty()}
          click={ c => this.addToKitty(c) }/>,
        <br/>,
        <CardGroup
          isActive
          cards={this.state.kitty}
          click={ c => this.removeFromKitty(c) }/>,
        <br/>,
        <button type="button" className="btn btn-light" 
          onClick={ () => this.confirm() }
          disabled={this.state.kitty.length !== KITTY_SIZE}>Confirm</button>,
        <br/>,
      ];
    } else {
      return [
        <Hand
          isActive
          player={mePlayer}
          cards={this.props.hand}/>,
        <br/>,
      ]
    }
  }

  render() {
    return (
      <div>
        <p>Selecting 6 cards</p>

        {this.props.children}

        {this.renderKitty(this.props.mePlayer)}

      </div>
    );
  }
}

export default Kitty;
