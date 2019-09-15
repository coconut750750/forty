import React, { Component } from 'react';

class Icon extends Component {
  render() {
    return (
      <div className="hand fan">
        <img
          className="playing-card"
          alt="logo"
          src="cards/4h.svg"
          style={{ height: "50px" }}/>
        <img
          className="playing-card"
          alt="logo"
          src="cards/0s.svg"
          style={{ height: "50px" }}/>
        
      </div>
    );
  }
}

export default Icon;
