import React, { Component } from 'react';

class Join extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameCode: '',
      name: '',
    }
  }

  render() {
    return (
      <div>
        <p>Join Game</p>

        <input type="name" className="form-control" placeholder="Enter game code" 
          value={this.state.gameCode} 
          onChange={ e => this.setState({ gameCode: e.target.value })}/>
        <br/>
        <input type="name" className="form-control" placeholder="Enter your name" 
          value={this.state.name} 
          onChange={ e => this.setState({ name: e.target.value })}/>

        <br/>

        <div className="row d-flex justify-content-center">
          <button type="button" className="btn btn-light" onClick={this.props.onBack}>Back</button>
          <button type="button" className="btn btn-light" 
            onClick={ () => this.props.onJoin(this.state.gameCode, this.state.name) }>Join</button>
        </div>
      </div>
    );
  }
}

export default Join;
