import React, { Component } from 'react';

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    }
  }

  render() {
    return (
      <div>
        <p>Create Game</p>

        <input type="name" className="form-control" placeholder="Enter your name" value={this.state.name} onChange={ e => this.setState({ name: e.target.value })}/>

        <br/>

        <div className="row d-flex justify-content-center">
          <button type="button" className="btn btn-light" onClick={this.props.onBack}>Back</button>
          <button type="button" className="btn btn-light" onClick={ () => this.props.onCreate(this.state.name) }>Create</button>
        </div>
      </div>
    );
  }
}

export default Create;
