import React from 'react';
import io from 'socket.io-client';

import { createGame } from 'api/register';

import Home from 'views/Home';
import HowTo from 'views/HowTo';
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
                joinGame={ () => this.setState({ viewState: "join" }) }
                viewHowTo={ () => this.setState({ viewState: "howto" }) }/>,
      howto:  <HowTo
                goBack={ () => this.setState({ viewState: "home" }) }/>,
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
            <br/>
            <div className="row justify-content-center align-items-center">
              <div className="col-2">
                <h3>Forty</h3>
              </div>

              <div className="col-2">
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
              </div>
                
            </div>
            

            <p>A 4-player trick-taking card game</p>
          </div>

          <hr/>

          {views[this.state.viewState]}

          <hr/>

          <div>
            <small>built by <a href="http://brandon-wang.me">brandon wang</a></small>
            <br/>
            {/* <small>view on github</small> */}
          </div>

        </div>
      </div>
    );
  }
}

export default App;
