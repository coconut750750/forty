function socketio(socket, game, name, player) {
  socket.on('getPlayers', data => {
    socket.emit('players', game.getPlayerData());
  });

  socket.on('startGame', data => {
    if (game.isFull()) {
      game.start();
    } else {
      socket.emit('startFail', { message: 'Not enough players have joined the game' });
    }
  });

  socket.on('getPhase', data => {
    socket.emit('phase', { phase: game.phase });
  });

  socket.on('getLevel', data => {
    socket.emit('level', { level: game.getTrumpRank() });
  });

  socket.on('readyForAction', data => {
    if (name === game.getActionPlayerName()) {
      game.notifyActionPlayer();
    }
  });

  socket.on('permutePlayers', data => {
    game.permute();
  });

  socket.on('startRound', data => {
    game.startRound();
    game.notifyPlayerUpdate();
    game.startDeal();
  });

  socket.on('getHand', data => {
    player.sendHand();
  });

  socket.on('getLegalCards', data => {
    if (game.canSetTrumpSuit()) {
      player.sendCardsToReveal();
    } else if (game.phase === 'kitty' && name === game.getActionPlayerName()) {
      player.sendCardsForKitty();
    } else if (game.phase === 'tricks' && name === game.getActionPlayerName()) {
      player.sendCardsToPlay();
    }
  });

  socket.on('draw', data => {
    try {
      game.deal(name);
    } catch (err) {
      socket.emit('message', { message: err.message });
    }
  });

  socket.on('setTrump', data => {
    const { card } = data;
    game.setTrumpSuit(card, name);
  });

  socket.on('setTrumpFromKitty', data => {
    game.forceSetTrump();
  });

  socket.on('getKittyReveal', data => {
    game.notifyRevealed(game.trumpRevealed)
  });

  socket.on('getTrump', data => {
    if (game.trumpCard !== undefined) {
      socket.emit('trump', { card: game.trumpCard.json(), name: game.trumpSetter });
    }
  });

  socket.on('setKitty', data => {
    game.setKitty(data.cards);
    game.startTrick();
  });

  socket.on('getKitty', data => {
    if (game.phase === 'roundEnd') {
      socket.emit('kitty', { cards: game.kitty });
    }
  });

  socket.on('playCard', data => {
    try {
      game.playCard(player, data.card);
    } catch (err) {
      socket.emit('message', { message: err.message });
    }
  });

  socket.on('getPlay', data => {
    socket.emit('play', { trick: game.trick.json() });
  });

  socket.on('getTrick', data => {
    socket.emit('trick', {
      points: game.points,
      cards: game.pointCards,
      winner: game.winnerIndex,
    });
  });

  socket.on('getResults', data => {
    socket.emit('results', game.getResults());
  });
}

module.exports = socketio;
