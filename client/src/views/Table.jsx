import React, { Component } from 'react';

import GameCode from 'components/GameCode';
import GameCircle from 'components/GameCircle';

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
      meIndex: -1,
      hand: [],

      cardsOnTable: {},
      points: 0,
    };
  }

  resetRoundData() {
    this.setState({
      cardsOnTable: {},
      points: 0,
    });
  }

  componentDidMount() {
    this.props.socket.on('players', data => {
      const meIndex = _.findIndex(data.players, { name: this.props.name });

      this.setState({
        players: data.players.map(p => new Player(p.name, p.isAdmin, p.active, p.team)),
        meIndex,
      });
    });

    this.props.socket.on('phase', data => {
      this.setState({ phase: data.phase });
      this.props.socket.emit('readyForAction', {});
      if (data.phase === 'deal') {
        this.resetRoundData();
      }
    });

    this.props.socket.on('trump', data => {
      var cardsOnTable = { [data.name]: new Card(data.card.rank, data.card.suit) };
      this.setState({ cardsOnTable });
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

  // renderTrumpCircle() {
  //   const nPlayers = this.state.players.length;
  //   const mePlayer = this.state.players[this.meIndex];
  //   const rightPlayer = this.state.players[(this.meIndex + 1) % nPlayers];
  //   const acrossPlayer = this.state.players[(this.meIndex + 2) % nPlayers];
  //   const leftPlayer = this.state.players[(this.meIndex + 3) % nPlayers];

  //   return (
  //     <GameCircle
  //         acrossPlayer={acrossPlayer}
  //         acrossCard={this.state.trumpSetter === acrossPlayer.name ? this.state.trumpCard : undefined}
  //         leftPlayer={leftPlayer}
  //         leftCard={this.state.trumpSetter === leftPlayer.name ? this.state.trumpCard  : undefined}
  //         rightPlayer={rightPlayer}
  //         rightCard={this.state.trumpSetter === rightPlayer.name ? this.state.trumpCard  : undefined}
  //         meCard={this.state.trumpSetter === mePlayer.name ? this.state.trumpCard : undefined}/>
  //   );
  // }

  renderGameCircle() {
    const nPlayers = this.state.players.length;
    if (nPlayers === 0) {
      return undefined;
    }

    const mePlayer = this.state.players[this.state.meIndex];
    const rightPlayer = this.state.players[(this.state.meIndex + 1) % nPlayers];
    const acrossPlayer = this.state.players[(this.state.meIndex + 2) % nPlayers];
    const leftPlayer = this.state.players[(this.state.meIndex + 3) % nPlayers];

    console.log(this.state.players);

    return (
      <GameCircle
          acrossPlayer={acrossPlayer}
          acrossCard={this.state.cardsOnTable[acrossPlayer.name]}
          leftPlayer={leftPlayer}
          leftCard={this.state.cardsOnTable[leftPlayer.name]}
          rightPlayer={rightPlayer}
          rightCard={this.state.cardsOnTable[rightPlayer.name]}
          meCard={this.state.cardsOnTable[mePlayer.name]}/>
    );
  }

  render() {
    const game_views = {
      teams:    <Teams 
                  players={this.state.players}
                  socket={this.props.socket}/>,
      deal:     <Deal
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.players[this.state.meIndex]}>
                  {this.renderGameCircle()}
                </Deal>,
      kitty:    <Kitty
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.players[this.state.meIndex]}>
                  {this.renderGameCircle()}
                </Kitty>,
      tricks:   <Trick
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.players[this.state.meIndex]}>
                  {this.renderGameCircle()}
                </Trick>,
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
