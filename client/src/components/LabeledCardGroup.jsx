import React, { Component } from 'react';

import CardGroup from 'components/CardGroup';

class LabeledCardGroup extends Component {
  render() {
    return (
      <div className={this.props.className}>
        <div className={`badge m-2 badge-info`}>{ this.props.label }</div>

        <br/>
        
        <CardGroup
          isActive={this.props.isActive}
          cards={this.props.cards}
          click={ c => this.props.click(c) }
        />
      </div>
    );
  }
}

export default LabeledCardGroup;
