import React, { Component } from 'react';

import ExitButton from 'components/ExitButton';
import GameCode from 'components/GameCode';
import GameCircle from 'components/GameCircle';
import Hand from 'components/Hand';

import Teams from 'game_views/Teams';
import Deal from 'game_views/Deal';
import Kitty from 'game_views/Kitty';
import Trick from 'game_views/Trick';
import RoundSummary from 'game_views/RoundSummary';

import Card from 'models/card';

import { getMeIndex, newPlayer } from 'utils/player_utils';

var _ = require('lodash');

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: undefined,

      players: [],
      mePlayer: undefined,
      meIndex: -1,
      hand: [],

      trumpCard: undefined,

      cardsOnTable: {},
      centerCards: [],
      points: 0,
    };
  }

  resetRoundData() {
    this.setState({
      trumpCard: undefined,
      cardsOnTable: {},
      centerCards: [],
      points: 0,
    });
  }

  startNewTrick() {
    var players = this.state.players;
    _.forEach(players, p => p.resetWin());
    this.setState({ players });
  }

  componentDidMount() {
    this.props.socket.on('players', data => {
      const players = data.players.map(p => newPlayer(p));
      const meIndex = getMeIndex(players, this.props.name);
      const mePlayer = players[meIndex];

      this.setState({
        players,
        mePlayer,
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
      const trumpCard = new Card(data.card.rank, data.card.suit)
      var cardsOnTable = { [data.name]: trumpCard };
      this.setState({ cardsOnTable, trumpCard });
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

      var centerCards = this.state.centerCards;
      data.cards.forEach(c => centerCards.push(new Card(c.rank, c.suit)));

      this.setState({ points: data.points, players, centerCards });
    });

    this.props.socket.on('play', data => {
      var { trick } = data;
      var cardsOnTable = {};
      _.forEach(trick, (card, name) => { cardsOnTable[name] = new Card(card.rank, card.suit); });
      this.setState({ cardsOnTable });

      if (Object.keys(cardsOnTable).length === 1) {
        this.startNewTrick();
      }
    });

    this.props.socket.on('kitty', data => {
      var kitty = data.cards.map(c => new Card(c.rank, c.suit));
      this.setState({ centerCards: kitty });
    })

    this.props.socket.emit('getPlayers', {});
    this.props.socket.emit('getPhase', {});
    this.props.socket.emit('getHand', {});
    this.props.socket.emit('getTrump', {});
  }

  renderGameCircle(showPoints) {
    const nPlayers = this.state.players.length;
    if (nPlayers === 0) {
      return undefined;
    }

    const rightPlayer = this.state.players[(this.state.meIndex + 1) % nPlayers];
    const acrossPlayer = this.state.players[(this.state.meIndex + 2) % nPlayers];
    const leftPlayer = this.state.players[(this.state.meIndex + 3) % nPlayers];

    return (
      <GameCircle
        trumpCard={this.state.trumpCard}
        acrossPlayer={acrossPlayer}
        acrossCard={this.state.cardsOnTable[acrossPlayer.name]}
        leftPlayer={leftPlayer}
        leftCard={this.state.cardsOnTable[leftPlayer.name]}
        rightPlayer={rightPlayer}
        rightCard={this.state.cardsOnTable[rightPlayer.name]}
        meCard={this.state.cardsOnTable[this.state.mePlayer.name]}
        centerCards={this.state.centerCards}>
        <Hand
          className="col-6"
          cards={this.state.centerCards}
          label={showPoints && `Points: ${this.state.points}`}/>
      </GameCircle>
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
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle()}
                </Deal>,
      kitty:    <Kitty
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle()}
                </Kitty>,
      tricks:   <Trick
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle(true)}
                </Trick>,
      endRound: <RoundSummary
                  socket={this.props.socket}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle()}
                </RoundSummary>,
    };
    return (
      <div>
        <GameCode gameCode={this.props.gameCode}/>
        <p>Table</p>

        {game_views[this.state.phase]}

        <ExitButton
          mePlayer={this.state.mePlayer}
          exitGame={ () => this.props.exitGame() }/>

        <br/>
      </div>
    );
  }
}

export default Table;
