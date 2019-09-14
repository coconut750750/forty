import React, { Component } from 'react';

import PlayerList from 'components/PlayerList';

var _ = require('lodash');

class RoundResults extends Component {
  render() {
    if (this.props.results === undefined) {
      return <div className="d-flex justify-content-center"></div>;
    }

    var defenders = _.cloneDeep(this.props.results.defenders);
    defenders.forEach(p => p.win());

    return (
      <div>
        {this.props.results.gameOver ?
        <p style={{ margin: 0 }}>Game Over</p>
          :
        <p style={{ margin: 0 }}>Results</p>
        }

        <div className={`badge m-2 badge-info`}>{`Points: ${this.props.results.points}`}</div>

        <div className="d-flex justify-content-center">
          <div className="col-6">
            <PlayerList players={defenders}/>
            <div className="badge m-2 badge-info">{`Level: ${this.props.results.defenseLevel}`}</div>
          </div>

          <div className="col-6">
            <PlayerList players={this.props.results.challengers}/>
            <div className="badge m-2 badge-info">{`Level: ${this.props.results.challengeLevel}`}</div>
          </div>
        </div>

      </div>
    );
  }
}

export default RoundResults;
