import React from 'react';
import io from 'socket.io-client';

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
      viewState: "home",
      gameCode: "",
      name: "",
    };
  }

  setGame(gameCode, name) {
    this.socket = io();
    this.socket.on('start', data => {
      this.setState({ viewState: "table" });
    });

    this.socket.on('end', data => {
      this.exitGame();
    });

    this.socket.on('disconnect', data => {
      this.setState({ viewState: "home", gameCode: "", name: "" });
    });
    
    this.setState({
      viewState: "lobby",
      gameCode,
      name,
    });
  }

  exitGame() {
    this.socket.emit('exitGame', {});
    this.socket.disconnect();
    this.setState({ viewState: "home", gameCode: "", name: "" });
  }

  render() {
    const views = {
      home:   <Home 
                createGame={ () => this.setState({ viewState: "create" }) } 
                joinGame={ () => this.setState({ viewState: "join" }) }/>,
      create: <Create
                goBack={ () => this.setState({ viewState: "home" }) }
                create={ name => createGame().then(res => this.setGame(res.gameCode, name)) }/>,
      join:   <Join
                goBack={ () => this.setState({ viewState: "home" }) }
                join={ (gameCode, name) => this.setGame(gameCode, name) }/>,
      lobby:  <Lobby
                socket={this.socket}
                gameCode={this.state.gameCode}
                name={this.state.name}
                exitGame={ () => this.exitGame() }/>,
      table:  <Table
                socket={this.socket}
                gameCode={this.state.gameCode}
                name={this.state.name}
                exitGame={ () => this.exitGame() }/>,
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
