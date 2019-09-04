import React, { Component } from 'react';

import PlayerList from 'components/PlayerList';

class RoundResults extends Component {
  render() {
    if (this.props.results === undefined) {
      return <div className="d-flex justify-content-center"></div>;
    }

    return (
      <div className="d-flex justify-content-center">
        <div className={`badge m-2 badge-info`}>{`Points: ${this.props.results.points}`}</div>
        <p style={{ margin: 0 }}>Results</p>
        <PlayerList players={this.props.results.defenders}/>
        <p>{this.props.results.defenseLevel}</p>
        <PlayerList players={this.props.results.attackers}/>
        <p>{this.props.results.attackLevel}</p>
      </div>
    );
  }
}

export default RoundResults;
