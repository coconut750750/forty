import React, { Component } from 'react';

class Deal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dealActive: false,
    };
  }

  componentDidMount() {
    this.props.socket.on('action', data => {
      this.setState({ dealActive: true });
    });
  }

  draw() {
    this.props.socket.emit('draw', {});
    this.setState({ dealActive: false });
  }

  render() {
    return (
      <div>
        <p>Dealing cards</p>

        {this.props.hand.map(c => <p>{`${c.rank}${c.suit} `}</p>)}

        <button type="button" className="btn btn-light" 
          onClick={ () => this.draw() }
          disabled={!this.state.dealActive}>Draw</button>

      </div>
    );
  }
}

export default Deal;
