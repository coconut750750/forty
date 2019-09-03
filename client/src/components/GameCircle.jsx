import React, { Component } from 'react';

import Hand from 'components/Hand';

class GameCircle extends Component {
  render() {
    return (
      <div>
        <div className="d-flex justify-content-center">
          <div className="col-4"></div>

          <Hand
            className="col-4"
            player={this.props.acrossPlayer}
            cards={this.props.acrossCard ? [this.props.acrossCard] : undefined}/>

          <Hand
            className="col-4"
            cards={this.props.trumpCard ? [this.props.trumpCard] : undefined}/>
        </div>

        <div className="d-flex justify-content-center">
          <Hand
            className="col-3"
            player={this.props.leftPlayer}
            cards={this.props.leftCard ? [this.props.leftCard] : undefined}/>

         <Hand
            className="col-6"
            cards={this.props.centerCards}/>

          <Hand
            className="col-3"
            player={this.props.rightPlayer}
            cards={this.props.rightCard ? [this.props.rightCard] : undefined}/>
        </div>

        <Hand
            cards={this.props.meCard ? [this.props.meCard] : undefined}/>
      </div>
    );
  }
}

export default GameCircle;
