module.exports = {
  ErrorInvalidTrumpReveal: new Error("Cannot set trump suit with that card"),
  ErrorCannotForceSetTrump: new Error("Trump card already set"),
  ErrorCannotSetKitty: new Error("You cannot set the kitty"),
  ErrorInvalidNumberOfCardsForKitty: new Error("Invalid number of cards"),
};
