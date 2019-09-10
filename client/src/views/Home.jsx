import React, { Component } from 'react';

class Home extends Component {
  render() {
    return (
      <div>
        <div className="row d-flex justify-content-center">
          <button type="button" className="btn btn-light" onClick={this.props.joinGame}>Join Game</button>
          <button type="button" className="btn btn-light" onClick={this.props.createGame}>Create Game</button>
        </div>

        <div class="btn-group-vertical">
          <button type="button" class="btn btn-light" onClick={this.props.viewHowTo}>How to Play</button>
        </div>
      </div>
    );
  }
}

export default Home;
