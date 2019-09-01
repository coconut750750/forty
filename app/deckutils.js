var Card = require('./card');
const { RANKS, SUITS, SJOKER, FJOKER } = require('./const');

function newDeck() {
  var deck = [];
  for (var rank of RANKS) {
    for (var suit of SUITS) {
      deck.push(new Card(rank, suit));
    }
  }

  deck.push(new Card(SJOKER, ''));
  deck.push(new Card(FJOKER, ''));
  return shuffle(deck);
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function calibrate(deck, trumpCard) {
  for (var card of deck) {
    card.calibrate(trumpCard);
  }
}

module.exports = {
  newDeck: () => newDeck(),
  calibrate,
}