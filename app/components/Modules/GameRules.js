import React from 'react';
import game_settings from './game_rules.json';

class GameRules extends React.Component {
  renderTab(item, PARENT) {
    let cls = Math.floor(Math.random() * 10000 + 1);
    cls = 'cls_' + cls;
    return (
      <div className="accordian_box card">
        <div className="accordian-box-header card-header " id={cls + 'heading'}>
          <h5
            className="mb-0 accordian_click text-white "
            data-toggle="collapse"
            data-target={'#' + cls + 'e'}
            aria-expanded="false"
            aria-controls={cls + 'e'}
          >
            {item.title}
          </h5>
        </div>
        <div
          id={cls + 'e'}
          className="collapse  card-body"
          aria-labelledby={cls + 'heading'}
          data-parent={'#' + PARENT}
        >
          <div className="accordian-box-body" id={cls + 'cardbody'}>
            {item.type == 'paragraph' || item.type == 'tab' ? (
              <p className="text-white">{item.value}</p>
            ) : (
              ''
            )}
            {item.type == 'list' ? (
              <ul className="list">
                {item.list.map((list_item, i) => {
                  return <li key={i}>{list_item}</li>;
                })}
              </ul>
            ) : (
              ''
            )}
            {item.content &&
              item.content.map((itm, i) => {
                return itm.type == 'tab' ? (
                  this.renderTab(itm, cls + 'cardbody')
                ) : itm.type == 'paragraph' ? (
                  <p className="text-white" key={'k_' + i}>
                    {itm.value}
                  </p>
                ) : itm.type == 'h2' ? (
                  <h4 className="text-white mb-1" key={'k_' + i}>
                    {itm.value}
                  </h4>
                ) : itm.type == 'list' ? (
                  <ul className="list text-white rule_list" key={'k_' + i}>
                    {itm.list.map((list_item, i) => {
                      return <li key={i}>{list_item}</li>;
                    })}
                  </ul>
                ) : itm.type == 'paragraph_html' ? (
                  <p
                    key={'k_' + i}
                    className="text-white"
                    dangerouslySetInnerHTML={{
                      __html: itm.value
                    }}
                  />
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
    if (!ttl) {
      return false;
    }
    ttl = ttl.toLowerCase();
    ttl = ttl.replace(new RegExp(' ', 'g'), '');
    ttl = ttl.replace(new RegExp('-', 'g'), '');
    ttl = ttl.replace(new RegExp('_', 'g'), '');
    if (!game_settings[ttl]) {
      return false;
    }
    const rules = game_settings[ttl];

    return (
      <div id="accordion">
        {rules.map((item, i) => {
          return item.type == 'tab' ? this.renderTab(item, 'accordion') : false;
        })}
      </div>
    );
  }
}
export default GameRules;
