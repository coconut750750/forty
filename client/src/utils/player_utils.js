import Player from 'models/player';

var _ = require('lodash');

export function getMeIndex(players, name) {
  return _.findIndex(players, { name });
}

export function getMePlayer(players, name) {
  return players[getMeIndex(players, name)];
}

export function newPlayer(playerJson) {
  return new Player(playerJson.name, playerJson.isAdmin, playerJson.active, playerJson.team);
}