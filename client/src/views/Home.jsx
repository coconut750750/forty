import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="row d-flex justify-content-center">
          <button type="button" className="btn btn-light" onClick={this.props.joinGame}>Join Game</button>
          <button type="button" className="btn btn-light" onClick={this.props.createGame}>Create Game</button>
        </div>
      </div>
    );
  }
}

export default Home;
