import React, { Component } from 'react';

import GameCode from 'components/GameCode';

import Teams from 'game_views/Teams';
import Deal from 'game_views/Deal';

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
    };
  }

  resetGameData() {
    this.setState({
      trumpCard: undefined,
    });
  }

  componentDidMount() {
    this.props.socket.on('players', data => {
      this.setState({ players: data.players });
    });

    this.props.socket.on('phase', data => {
      this.setState({ phase: data.phase });
      this.props.socket.emit('readyForAction', {});
    });

    this.props.socket.on('setTrump', data => {
      this.setState({ trump: new Card(data.rank, data.suit) });
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
  }

  render() {
    const game_views = {
      teams:  <Teams 
                players={this.state.players}
                socket={this.props.socket}/>,
      deal:   <Deal
                socket={this.props.socket}
                hand={this.state.hand}/>,
    };
    return (
      <div>
        <p>Table</p>
        <GameCode gameCode={this.props.gameCode}/>

        <br/>

        {game_views[this.state.phase]}

        <br/>
      </div>
    );
  }
}

export default Table;
