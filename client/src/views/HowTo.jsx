import React, { Component } from 'react';

class HowTo extends Component {
  render() {
    return (
      <div>
        <div className="text-left">
          <h3>How to Play</h3>

          <h5>Introduction</h5>
          <p>Forty Points is a trick-taking game played with two teams of two people and with a 54 card deck.</p>

          <h5>Objective</h5>
          <p>The objective of the game is to reach the final level of play. The levels of play being at 2 and increase sequentially with the ranks of the cards up to A (2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A).</p>
          <p>One team will be defending, trying to prevent the other challenger team from capturing points. If defending team successfully prevents the other team from reaching 40 points, they may advance levels. Otherwise, the challenging team becomes the defending team, and can potentially advance levels.</p>

          <h5>The Start</h5>
          <p>A player is randomly chosen, and that team is the first defending team. </p>

          <h5>The Deal</h5>
          <p>Going counterclockwise, each player draws a card one at a time, until all players have 12 cards. At any time during the deal, a player may reveal a card with a rank equal to the defending team's level (the Trump rank), and thus declare the Trump suit. A player is not obligated to reveal a card if they draw a card equal to the level-of-play. </p>
          <p>If no Trump suit was declared when all players have 12 cards, a Trump suit is determined by revealing the 6 extra cards one at a time, until a card with the level-of-play rank is reveal. If no such card appears, the card with the high rank is chosen. The suit of that card becomes the Trump suit. </p>
          <p>Once all players have 12 cards, the first player that drew receives six extra cards. That player may choose to exchange up to 6 cards from his/her original hand with the 6 extra cards to improve the hand. This player leads the first trick.</p>

          <h5>Card Order</h5>
          <p>At this point, the level-of-play card and the Trump suit is known. The following is the relative ranking between the cards:</p>
          <p>1. High joker</p>
          <p>2. Low joker</p>
          <p>3. Trump-rank card with Trump-suit</p>
          <p>4. Three other Trump-rank cards (if more than one are played in a trick, the first one to be played dominates)</p>
          <p>5. The remaining cards of Trump suit from A-2 </p>
          <p>6. The remaining suits ranked from A-2 excluding the Trump-rank cards (the suit that is led in a trick dominates the other cards from the other two suits)</p>


          <h5>The Play</h5>
          <p>The leader of the trick starts by playing a card from his/her hand. Going counterclockwise, each player must follow suit unless if they are out of that suit. If a Trump card is led, each player must play a Trump card (this includes Jokers, Trump-rank, and Trump-suit cards), unless if they are out. In either case, if a player is out, he/she may play any card.</p>

          <h5>The Points</h5>
          <p>The player with the highest card wins the trick. If that player is a defender, no points are awarded. If that player is a challenger, points are awarded based on the cards that were played. A 5 is 5 points and a 10 and K are 10 points. If a challenger wins the last trick, the points in the 6 discarded cards are doubled and awarded to the challenging team. </p>

          <h5>The Scoring</h5>
          <p>Once the total points are calculated, here is how the teams and levels change:</p>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Points captured by challenger team</th><th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>Defenders advance two levels*</td></tr>
              <tr><td>5-35</td><td>Defenders advance one level</td></tr>
              <tr><td>40-75</td><td>Challengers become Defenders</td></tr>
              <tr><td>80-95</td><td>Challengers become Defenders and advance one level</td></tr>
              <tr><td>100+</td><td>Challengers become Defenders and advance two levels*</td></tr>
            </tbody>
          </table>
          <small>*The A level cannot be skipped. Note: once a team advances beyond the A level, the game is over.</small>

        </div>

        <button type="button" className="btn btn-light" onClick={this.props.goBack}>Back</button>

      </div>
    );
  }
}

export default HowTo;
