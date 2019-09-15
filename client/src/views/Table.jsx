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

      trumpNeeded: false,
      trumpCardOnCircle: {},
      trickCardsOnCircle: {},

      kittyBefore: [],
      pointCards: [],
      kittyAfter: [],
      points: 0,
    };
  }

  resetRoundData() {
    this.setState({
      trumpNeeded: false,
      trumpCardOnCircle: {},
      trickCardsOnCircle: {},

      kittyBefore: [],
      pointCards: [],
      kittyAfter: [],
      points: 0,
    });
  }

  resetPlayerTeams() {
    var players = this.state.players;
    _.forEach(players, p => { p.team = undefined; });
    this.setState({ players });
  }

  resetPlayerWins() {
    var players = this.state.players;
    _.forEach(players, p => p.resetWin());
    this.setState({ players });
  }

  componentDidMount() {
    this.props.socket.on('phase', data => {
      this.setState({ phase: data.phase });
      if (data.phase === 'teams') {
        this.resetPlayerTeams();
        this.resetPlayerWins();
      } else if (data.phase === 'deal') {
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
        this.setState({ trumpNeeded: true });
      } else {
        const trumpCard = new Card(data.card.rank, data.card.suit)
        var trumpCardOnCircle = { [data.name]: trumpCard };
        this.setState({ trumpCardOnCircle });

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
        this.resetPlayerWins();
      }
    });

    this.props.socket.on('kitty', data => {
      var kittyAfter = data.cards.map(c => new Card(c.rank, c.suit));
      this.setState({ kittyAfter });
    });

    this.props.socket.emit('getPlayers', {});
    this.props.socket.emit('getPhase', {});
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
        trumpCard={Object.values(this.state.trumpCardOnCircle)[0]}
        acrossPlayer={acrossPlayer}
        leftPlayer={leftPlayer}
        rightPlayer={rightPlayer}
        cards={circleCards}
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
                  trumpNeeded={this.state.trumpNeeded}>
                  {this.renderGameCircle(this.state.trumpCardOnCircle)}
                </Deal>,
      kitty:    <Kitty
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle(this.state.trumpCardOnCircle, this.state.kittyBefore, 'Revealed Cards')}
                </Kitty>,
      tricks:   <Trick
                  socket={this.props.socket}
                  hand={this.state.hand}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle(this.state.trickCardsOnCircle, this.state.pointCards, `Points: ${this.state.points}`)}
                </Trick>,
      roundEnd: <RoundEnd
                  socket={this.props.socket}
                  mePlayer={this.state.mePlayer}>
                  {this.renderGameCircle(this.state.trickCardsOnCircle, this.state.kittyAfter, 'Revealed Cards')}
                </RoundEnd>,
    };
    return (
      <div>
        <GameCode gameCode={this.props.gameCode}/>

        {game_views[this.state.phase]}

        <ExitButton
          mePlayer={this.state.mePlayer}
          exitGame={ () => this.props.exitGame() }/>
      </div>
    );
  }
}

export default Table;
