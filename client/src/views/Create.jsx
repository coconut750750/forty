import React, { Component } from 'react';
import Select from 'react-select'

import { checkName } from 'api/register';

const levels = [
  { value: 0, label: '2' },
  { value: 1, label: '3' },
  { value: 2, label: '4' },
  { value: 3, label: '5' },
  { value: 4, label: '6' },
  { value: 5, label: '7' },
  { value: 6, label: '8' },
  { value: 7, label: '9' },
  { value: 8, label: '10' },
]

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      startingLevel: undefined,
      message: undefined,
    }
  }

  async createGame() {
    checkName(this.state.name).then(res => {
      if (!res.valid) {
        this.setState({ message: res.message });
        return;
      }

      var startingLevel = this.state.startingLevel == undefined ? 0 : this.state.startingLevel.value
      this.props.create(this.state.name, { starting_level: startingLevel });
    });
  }

  render() {
    return (
      <div>
        <h5>Create Game</h5>

        <input type="name" className="form-control" placeholder="Enter your name" value={this.state.name} onChange={ e => this.setState({ name: e.target.value })}/>
        
        <br />
        <h6>Options</h6>
        <Select options={levels} placeholder="Starting Level" value={this.state.startingLevel} onChange={ v => this.setState({ startingLevel: v })}/>

        <br/>

        <div className="row d-flex justify-content-center">
          <button type="button" className="btn btn-light" onClick={this.props.goBack}>Back</button>
          <button type="button" className="btn btn-light" onClick={ () => this.createGame() }>Create</button>
        </div>

        {this.state.message && <div class="alert alert-danger" role="alert">
          {this.state.message}
        </div>}
      </div>
    );
  }
}

export default Create;
