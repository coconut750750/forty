import React, { Component } from 'react';

import GameCode from 'components/GameCode';

import Teams from 'game_views/Teams';
import Deal from 'game_views/Deal';
import Kitty from 'game_views/Kitty';
import Trick from 'game_views/Trick';
import RoundSummary from 'game_views/RoundSummary';

import Card from 'models/card';
import Player from 'models/player';

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

      cardsOnTable: {},
      points: 0,
    };
  }

  resetRoundData() {
    this.setState({
      trumpCard: undefined,
      trumpSetter: undefined,

      cardsOnTable: {},
      points: 0,
    });
  }

  componentDidMount() {
    this.props.socket.on('players', data => {
      this.setState({ players: data.players.map(p => new Player(p.name, p.isAdmin, p.active, p.team)) });
      this.meIndex = _.findIndex(data.players, { name: this.props.name });
    });

    this.props.socket.on('phase', data => {
      this.setState({ phase: data.phase });
      this.props.socket.emit('readyForAction', {});
      if (data.phase === 'deal') {
        this.resetRoundData();
      }
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

    this.props.socket.on('trick', data => {
      var players = this.state.players;
      players[data.winner].win();
      this.setState({ points: data.points, players });
    });

    this.props.socket.on('play', data => {
      var { trick } = data;
      var cardsOnTable = {};
      _.forEach(trick, (card, name) => {
        cardsOnTable[name] = new Card(card.rank, card.suit);
      });
      this.setState({ cardsOnTable });
      if (Object.keys(cardsOnTable).length === 1) {
        var players = this.state.players;
        _.forEach(players, p => p.resetWin());
        this.setState({ players });
      }
    });

    this.props.socket.emit('getPlayers', {});
    this.props.socket.emit('getPhase', {});
    this.props.socket.emit('getHand', {});
    this.props.socket.emit('getTrump', {});
  }

  render() {
    const game_views = {
      teams:    <Teams 
                  players={this.state.players}
                  socket={this.props.socket}/>,
      deal:     <Deal
                  socket={this.props.socket}
                  hand={this.state.hand}
                  players={this.state.players}
                  meIndex={this.meIndex}
                  trumpCard={this.state.trumpCard}
                  trumpSetter={this.state.trumpSetter}/>,
      kitty:    <Kitty
                  socket={this.props.socket}
                  hand={this.state.hand}
                  players={this.state.players}
                  meIndex={this.meIndex}
                  trumpCard={this.state.trumpCard}
                  trumpSetter={this.state.trumpSetter}/>,
      tricks:   <Trick
                  socket={this.props.socket}
                  hand={this.state.hand}
                  players={this.state.players}
                  meIndex={this.meIndex}
                  cardsOnTable={this.state.cardsOnTable}
                  points={this.state.points}/>,
      endRound: <RoundSummary
                  socket={this.props.socket}/>,
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
