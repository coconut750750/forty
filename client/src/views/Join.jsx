import React, { Component } from 'react';

import { checkName, checkCode } from 'api/register';

class Join extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameCode: '',
      name: '',
      message: undefined,
    };
  }

  async joinGame() {
    checkCode(this.state.gameCode).then(res => {
      if (!res.valid) {
        this.setState({ message: res.message });
        return;
      }

      checkName(this.state.name, this.state.gameCode).then(res => {
        if (!res.valid) {
          this.setState({ message: res.message });
          return;
        }

        this.props.join(this.state.gameCode, this.state.name);
      });
    });
  }

  render() {
    return (
      <div>
        <p>Join Game</p>

        <input type="name" className="form-control" placeholder="Enter game code" 
          value={this.state.gameCode} 
          onChange={ e => this.setState({ gameCode: e.target.value }) }/>
        <br/>
        <input type="name" className="form-control" placeholder="Enter your name" 
          value={this.state.name} 
          onChange={ e => this.setState({ name: e.target.value }) }/>

        <br/>

        <div className="row d-flex justify-content-center">
          <button type="button" className="btn btn-light" onClick={this.props.goBack}>Back</button>
          <button type="button" className="btn btn-light" onClick={ () => this.joinGame() }>Join</button>
        </div>

        <br/>
        {this.state.message && <div class="alert alert-danger" role="alert">
          {this.state.message}
        </div>}
      </div>
    );
  }
}

export default Join;
