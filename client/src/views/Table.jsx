import React, { Component } from 'react';

import ExitButton from 'components/ExitButton';
import GameCode from 'components/GameCode';
import GameCircle from 'components/GameCircle';
import LabeledCardGroup from 'components/LabeledCardGroup';

import Teams from 'game_views/Teams';
import Deal from 'game_views/Deal';
import Kitty from 'game_views/Kitty';
import Trick from 'game_views/Trick';
import RoundEnd from 'game_views/RoundEnd';

import Card from 'models/card';
import Results from 'models/results';

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
      trumpMissing: false,

      trumpCardOnCircle: {},
      trickCardsOnCircle: {},

      kittyBefore: [],
      pointCards: [],
      kittyAfter: [],
      points: 0,

      results: undefined,
    };
  }

  resetRoundData() {
    this.setState({
      trumpCard: undefined,
      trumpMissing: false,

      trumpCardOnCircle: {},
      trickCardsOnCircle: {},

      kittyBefore: [],
      pointCards: [],
      kittyAfter: [],
      points: 0,

      results: undefined,
    });
  }

  startNewTrick() {
    var players = this.state.players;
    _.forEach(players, p => p.resetWin());
    this.setState({ players });
  }

  componentDidMount() {
    this.props.socket.on('phase', data => {
      this.setState({ phase: data.phase });

      if (data.phase === 'deal') {
        this.resetRoundData();
      }

      this.props.socket.emit('readyForAction', {});
    });

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

    this.props.socket.on('trump', data => {
      if (data.card === undefined) {
        this.setState({ trumpMissing: true });
      } else {
        const trumpCard = new Card(data.card.rank, data.card.suit)
        var trumpCardOnCircle = { [data.name]: trumpCard };
        this.setState({ trumpCardOnCircle, trumpCard });

        if (data.name === "") {
          this.props.socket.emit('getKittyReveal', {});
        }
      }
    });

    this.props.socket.on('reveal', data => {
      var kittyBefore = data.revealed.map(c => new Card(c.rank, c.suit));
      this.setState({ kittyBefore });
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

      var pointCards = this.state.pointCards;
      data.cards.forEach(c => pointCards.push(new Card(c.rank, c.suit)));

      this.setState({ points: data.points, players, pointCards });
    });

    this.props.socket.on('play', data => {
      var { trick } = data;
      var trickCardsOnCircle = {};
      _.forEach(trick, (card, name) => { trickCardsOnCircle[name] = new Card(card.rank, card.suit); });
      this.setState({ trickCardsOnCircle });

      if (Object.keys(trickCardsOnCircle).length === 1) {
        this.startNewTrick();
      }
    });

    this.props.socket.on('kitty', data => {
      var kittyAfter = data.cards.map(c => new Card(c.rank, c.suit));
      this.setState({ kittyAfter });
    });

    this.props.socket.on('results', data => {
      const defenders = data.defenders.map(p => newPlayer(p));
      const attackers = data.attackers.map(p => newPlayer(p));
      const results = new Results(data.points, defenders, data.defenseLevel, attackers, data.attackLevel, data.gameOver);
      this.setState({ results });
    });

    this.props.socket.emit('getPhase', {});
    this.props.socket.emit('getPlayers', {});
    // move these to specific game view components
    this.props.socket.emit('getHand', {});
    this.props.socket.emit('getTrump', {});
  }

  renderGameCircle(circleCards, centerCards, centerLabel) {
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
        acrossCard={circleCards[acrossPlayer.name]}
        leftPlayer={leftPlayer}
        leftCard={circleCards[leftPlayer.name]}
        rightPlayer={rightPlayer}
        rightCard={circleCards[rightPlayer.name]}
        meCard={circleCards[this.state.mePlayer.name]}>
        <LabeledCardGroup
          className="col-6"
          cards={centerCards}
          label={centerLabel}/>
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
                  mePlayer={this.state.mePlayer}
                  trumpMissing={this.state.trumpMissing}>
                  {this.renderGameCircle(this.state.trumpCardOnCircle)}
                </Deal>,
      kitty:    <Kitty
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle(this.state.trumpCardOnCircle, 'Revealed Cards', this.state.kittyBefore)}
                </Kitty>,
      tricks:   <Trick
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle(this.state.trickCardsOnCircle, `Points: ${this.state.points}`, this.state.pointCards)}
                </Trick>,
      roundEnd: <RoundEnd
                  socket={this.props.socket}
                  mePlayer={this.state.mePlayer}
                  results={this.state.results}>
                  {this.renderGameCircle(this.state.trickCardsOnCircle, 'Revealed Cards', this.state.kittyAfter)}
                </RoundEnd>,
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
