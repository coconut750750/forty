var Card = require('../card');
var Trick = require('../trick');

function createTrick(trumpCard, cards) {
  trumpCard.calibrate(trumpCard);
  var trick = new Trick();
  for (var card of cards) {
    card.calibrate(trumpCard);
    trick.addCard(card);
  }
  return trick;
}

function determineWinner(trumpCard, cards) {
  return createTrick(trumpCard, cards).determineWinnerPosition(trumpCard);
}

function calculatePoints(trumpCard, cards) {
  return createTrick(trumpCard, cards).calculatePoints();
}

describe('test determine winner position', () => {
  it('cards are all same, non trump suit, in order', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('a', 'h'), 
      new Card('k', 'h'), 
      new Card('j', 'h'), 
      new Card('3', 'h')
    ])).toBe(0);
  });

  it('cards are all same, non trump suit, random order', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('4', 'c'), 
      new Card('0', 'c'), 
      new Card('3', 'c'), 
      new Card('6', 'c')
    ])).toBe(1);
  });

  it('cards are all non trump suit but one is a non lead suit', () =>{
    expect(determineWinner(new Card('2', 's'), [
      new Card('j', 'c'), 
      new Card('q', 'c'), 
      new Card('a', 'h'), 
      new Card('6', 'c')
    ])).toBe(1);
  });

  it('cards are all non trump suit but all three are a non lead suit', () =>{
    expect(determineWinner(new Card('2', 's'), [
      new Card('3', 'c'), 
      new Card('q', 'h'), 
      new Card('a', 'd'), 
      new Card('6', 'h')
    ])).toBe(0);
  });

  it('lead card is not trump, but one card is trump suit', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('0', 'c'), 
      new Card('q', 'c'), 
      new Card('a', 'c'), 
      new Card('3', 's')
    ])).toBe(3);
  });

  it('lead card is not trump, but one card is trump suit, and one is trump rank', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('0', 'c'), 
      new Card('3', 's'), 
      new Card('2', 'd'), 
      new Card('5', 'c')
    ])).toBe(2);
  });

  it('lead card is trump, but one card is not trump', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('a', 's'), 
      new Card('3', 's'), 
      new Card('9', 'd'), 
      new Card('j', 's')
    ])).toBe(0);
  });

  it('two trump rank cards, but no trump card', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('a', 's'), 
      new Card('2', 'h'), 
      new Card('2', 'd'), 
      new Card('j', 's')
    ])).toBe(1);
  });

  it('two trump rank cards, with one trump card', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('a', 's'), 
      new Card('2', 'h'), 
      new Card('2', 's'), 
      new Card('j', 's')
    ])).toBe(2);
  });

  it('all trump with one joker', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('a', 's'), 
      new Card('2', 'h'), 
      new Card('2', 's'), 
      new Card('z', '')
    ])).toBe(3);
  });

  it('all trump with two jokers', () => {
    expect(determineWinner(new Card('2', 's'), [
      new Card('a', 's'), 
      new Card('2', 'h'), 
      new Card('z', ''), 
      new Card('y', '')
    ])).toBe(2);
  });
});

describe('test calculating total points', () => {
  it('no points in trick', () => {
    expect(calculatePoints(new Card('2', 's'), [
      new Card('a', 'h'), 
      new Card('q', 'h'), 
      new Card('j', 'h'), 
      new Card('3', 'h')
    ])).toBe(0);
  });

  it('5 points in trick', () => {
    expect(calculatePoints(new Card('2', 's'), [
      new Card('a', 'h'), 
      new Card('q', 'h'), 
      new Card('j', 'h'), 
      new Card('5', 'h')
    ])).toBe(5);
  });

  it('25 points in trick', () => {
    expect(calculatePoints(new Card('2', 's'), [
      new Card('a', 'h'), 
      new Card('k', 'h'), 
      new Card('0', 'h'), 
      new Card('5', 'h')
    ])).toBe(25);
  });

  it('trump card points in trick', () => {
    expect(calculatePoints(new Card('5', 's'), [
      new Card('a', 'h'), 
      new Card('4', 'h'), 
      new Card('8', 'h'), 
      new Card('5', 'h')
    ])).toBe(5);
  });
})