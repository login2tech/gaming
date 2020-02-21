import React from 'react';
import game_settings from './game_rules.json';

class GameRules extends React.Component {
  renderTab(item, PARENT) {
    let cls = Math.floor(Math.random() * 10000 + 1);
    cls = 'cls_' + cls;
    return (
      <div className="accordian_box">
        <div className="accordian-box-header" id={cls + 'heading'}>
          <h4
            className="mb-0 accordian_click"
            data-toggle="collapse"
            data-target={'#' + cls + 'e'}
            aria-expanded="false"
            aria-controls={cls + 'e'}
          >
            {item.title}
          </h4>
        </div>
        <div
          id={cls + 'e'}
          className="collapse"
          aria-labelledby={cls + 'heading'}
          data-parent={'#' + PARENT}
        >
          <div className="accordian-box-body" id={cls + 'cardbody'}>
            {item.value ? item.value : ''}
            {item.content &&
              item.content.map((itm, i) => {
                return itm.type == 'tab' ? (
                  this.renderTab(itm, cls + 'cardbody')
                ) : itm.type == 'paragraph' ? (
                  <p>{itm.value}</p>
                ) : (
                  false
                );
              })}
          </div>
        </div>
      </div>
    );
  }
  render() {
    let ttl = this.props.title;
    ttl = ttl.toLowerCase();
    ttl = ttl.replace(new RegExp(' ', 'g'), '');
    ttl = ttl.replace(new RegExp('-', 'g'), '');
    ttl = ttl.replace(new RegExp('_', 'g'), '');
    if (!game_settings[ttl]) {
      return false;
    }
    const rules = game_settings[ttl];

    return (
      <div id="accordionExample">
        {rules.map((item, i) => {
          return item.type == 'tab'
            ? this.renderTab(item, 'accordionExample')
            : false;
        })}
      </div>
    );
  }
}
export default GameRules;
