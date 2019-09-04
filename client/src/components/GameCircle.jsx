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

          {this.props.trumpCard ?
          <Hand
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
            cards={this.props.leftCard ? [this.props.leftCard] : undefined}/>

          {this.props.children}

          <Hand
            className="col-3"
            player={this.props.rightPlayer}
            cards={this.props.rightCard ? [this.props.rightCard] : undefined}/>
        </div>

        <div className="d-flex justify-content-center">
          <Hand
            className="col-4"
            cards={this.props.meCard ? [this.props.meCard] : undefined}/>
        </div>
      </div>
    );
  }
}

export default GameCircle;
