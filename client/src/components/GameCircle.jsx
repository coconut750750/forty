import React, { Component } from 'react';

import CardGroup from 'components/CardGroup';
import Hand from 'components/Hand';
import LabeledCardGroup from 'components/LabeledCardGroup';

class GameCircle extends Component {
  render() {
    const topCard = this.props.cards[this.props.topPlayer.name];
    const leftCard = this.props.cards[this.props.leftPlayer.name];
    const rightCard = this.props.cards[this.props.rightPlayer.name];
    const botCard = this.props.cards[this.props.botPlayer.name];

    return (
      <div>
        <div className="d-flex justify-content-center">
          <div className="col-4">
            <div className="badge m-2 badge-info">{`Level: ${this.props.level}`}</div>
          </div>

          <Hand
            className="col-4"
            player={this.props.topPlayer}
            cards={topCard && [topCard]}/>

          {this.props.trumpCard ?
          <LabeledCardGroup
            className="col-4"
            label={"Trump Card"}
            cards={[this.props.trumpCard]}/>
            :
            <div className="col-4"></div>}
        </div>

        <div className="d-flex justify-content-center">
          <Hand
            className="col-3"
            player={this.props.leftPlayer}
            cards={leftCard && [leftCard]}/>

          {this.props.children}

          <Hand
            className="col-3"
            player={this.props.rightPlayer}
            cards={rightCard && [rightCard]}/>
        </div>

        <div className="d-flex justify-content-center">
          <CardGroup
            className="col-4"
            cards={botCard && [botCard]}/>
        </div>
      </div>
    );
  }
}

export default GameCircle;
