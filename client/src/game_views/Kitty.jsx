import React, { useState, useEffect } from 'react';

import CardGroup from 'components/CardGroup';
import Hand from 'components/Hand';

var _ = require('lodash');

const KITTY_SIZE = 6;

export default function Kitty({ socket, hand, mePlayer, children }) {
  const [kittyActive, setKittyActive] = useState(false);
  const [handIndexes, setHandIndexes] = useState([]);
  const [kittyIndexes, setKittyIndexes] = useState([]);

  useEffect(() => {
    socket.on('action', data => {
      setKittyActive(true);
    });
  }, [socket]);

  useEffect(() => {
    setHandIndexes(hand.map((c, i) => i));
  }, [hand]);

  const confirm = () => {
    socket.emit('setKitty', { indexes: kittyIndexes });
  }

  const getHandWithoutKitty = () => {
    let filteredHand = handIndexes.map(i => hand[i]);
    if (kittyIndexes.length >= KITTY_SIZE) {
      filteredHand.forEach(c => c?.setHighlight(false));
    } else {
      filteredHand.forEach(c => c?.setHighlight(true));
    }
    return filteredHand;
  }

  const getKitty = () => {
    return kittyIndexes.map(i => hand[i]);
  }

  const addToKitty = (index) => {
    const handIndex = handIndexes[index];
    let newHandIndexes = [...handIndexes];
    newHandIndexes.splice(index, 1);

    setHandIndexes(newHandIndexes);
    setKittyIndexes([...kittyIndexes, handIndex]);
  }

  const removeFromKitty = (index) => {
    const handIndex = kittyIndexes[index];
    const newHandIndexes = _.sortBy([...handIndexes, handIndex]);

    let newKittyIndexes = [...kittyIndexes];
    newKittyIndexes.splice(index, 1);

    setHandIndexes(newHandIndexes);
    setKittyIndexes(newKittyIndexes);
  }

  const renderKitty = () => (
    <>
      <Hand
        isActive
        player={mePlayer}
        cards={getHandWithoutKitty()}
        click={ (c, index) => addToKitty(index) }/>
      <br/>
      <CardGroup
        isActive
        cards={getKitty()}
        click={ (c, index) => removeFromKitty(index) }/>
      <br/>
      <button type="button" className="btn btn-light" 
        onClick={ () => confirm() }
        disabled={kittyIndexes.length !== KITTY_SIZE}>Confirm</button>
      <br/>
    </>
  );

  return (
    <div>
      <h5>Selecting 6 cards</h5>

      {children}

      {kittyActive && renderKitty()}
      {!kittyActive &&
        <>
          <Hand
            isActive
            player={mePlayer}
            cards={hand}/>
          <br/>
        </>
      }

    </div>
  );
}
