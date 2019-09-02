import React, { Component } from 'react';

import GameCode from 'components/GameCode';

import Teams from 'game_views/Teams';
import Deal from 'game_views/Deal';
import Kitty from 'game_views/Kitty';

import Card from 'models/card';

var _ = require('lodash');

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: undefined,
      players: [],
      hand: [],

      trumpCard: undefined,
      trumpSetter: undefined,
    };
  }

  resetGameData() {
    this.setState({
      trumpCard: undefined,
      trumpSetter: undefined,
    });
  }

  componentDidMount() {
    this.props.socket.on('players', data => {
      this.setState({ players: data.players });
      this.meIndex = _.findIndex(data.players, { name: this.props.name });
    });

    this.props.socket.on('phase', data => {
      this.setState({ phase: data.phase });
      this.props.socket.emit('readyForAction', {});
    });

    this.props.socket.on('trump', data => {
      this.setState({
        trumpCard: new Card(data.card.rank, data.card.suit),
        trumpSetter: data.name,
      });
    });

    this.props.socket.on('hand', data => {
      var hand = data.hand.map(c => new Card(c.rank, c.suit));
      this.setState({ hand });

      this.props.socket.emit('getLegalCards', {});
    });

    this.props.socket.on('legal', data => {
      var hand = _.cloneDeep(this.state.hand);
      data.cards.forEach(i => { hand[i].highlight = true; });
      this.setState({ hand });
    });

    this.props.socket.emit('getPlayers', {});
    this.props.socket.emit('getPhase', {});
    this.props.socket.emit('getHand', {});
    this.props.socket.emit('getTrump', {});
  }

  render() {
    const game_views = {
      teams:  <Teams 
                players={this.state.players}
                socket={this.props.socket}/>,
      deal:   <Deal
                socket={this.props.socket}
                hand={this.state.hand}
                players={this.state.players}
                meIndex={this.meIndex}
                trumpCard={this.state.trumpCard}
                trumpSetter={this.state.trumpSetter}/>,
      kitty:  <Kitty
                socket={this.props.socket}
                hand={this.state.hand}
                players={this.state.players}
                meIndex={this.meIndex}
                trumpCard={this.state.trumpCard}
                trumpSetter={this.state.trumpSetter}/>,
    };
    return (
      <div>
        <GameCode gameCode={this.props.gameCode}/>
        <p>Table</p>

        {game_views[this.state.phase]}

        <br/>
      </div>
    );
  }
}

export default Table;
