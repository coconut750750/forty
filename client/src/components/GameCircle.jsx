import React, { Component } from 'react';

import CardGroup from 'components/CardGroup';
import Hand from 'components/Hand';
import LabeledCardGroup from 'components/LabeledCardGroup';

class GameCircle extends Component {
  render() {
    const acrossCard = this.props.cards[this.props.acrossPlayer.name];
    const leftCard = this.props.cards[this.props.leftPlayer.name];
    const rightCard = this.props.cards[this.props.rightPlayer.name];

    return (
      <div>
        <div className="d-flex justify-content-center">
          <div className="col-4"></div>

          <Hand
            className="col-4"
            player={this.props.acrossPlayer}
            cards={acrossCard && [acrossCard]}/>

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
            cards={this.props.meCard && [this.props.meCard]}/>
        </div>
      </div>
    );
  }
}

export default GameCircle;
