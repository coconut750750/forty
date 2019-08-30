import React from 'react';

import { createGame } from 'api/register';

import Home from 'views/Home';
import Create from 'views/Create';
import Join from 'views/Join';
import Lobby from 'views/Lobby';
import Table from 'views/Table';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "Click to generate code!",
      viewState: "home",
      gameCode: "",
      name: "",
    };
  }

  setGame(gameCode, name) {
    this.setState({
      viewState: "lobby",
      gameCode,
      name,
    });
  }

  render() {
    const views = {
      home:   <Home 
                onCreate={ () => this.setState({ viewState: "create" }) } 
                onJoin={ () => this.setState({ viewState: "join" }) }/>,
      create: <Create
                onBack={ () => this.setState({ viewState: "home" }) }
                onCreate={ name => createGame().then(res => this.setGame(res.gameCode, name)) }/>,
      join:   <Join
                onBack={ () => this.setState({ viewState: "home" }) }
                onJoin={ (gameCode, name) => this.setGame(gameCode, name) }/>,
      lobby:  <Lobby
                onEnd={ () => this.setState({ viewState: "home" }) }
                gameCode={this.state.gameCode}
                name={this.state.name}/>,
      table:  <Table/>,
    }

    return (
      <div className="App d-flex justify-content-center">
        <div className="container" style={{ maxWidth: "500px" }}>
          <div>
            Forty
          </div>

          <hr/>

          {views[this.state.viewState]}

          <hr/>

        </div>
      </div>
    );
  }
}

export default App;
