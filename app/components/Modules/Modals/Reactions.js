import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import Messages from '../../Messages';
import {Link} from 'react-router';

import React from 'react';

const emojis = [
  {key: 4, em: 'like'},
  {key: 3, em: 'heart'},
  {key: 2, em: 'angry'},
  {key: 1, em: '100'}
];

class Reactions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      is_loaded: false,
      showing: 'all'
    };
  }
  fetchUserInfo(forward) {
    fetch('/api/posts/reactionsList?pid=' + this.props.post_id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            items: json.items
          });
        }
      });
  }
  componentDidMount() {
    this.fetchUserInfo();
  }

  render() {
    if (!this.state.is_loaded) {
      return (
        <div className="modal-body">
          <span className="fa fa-spinner fa-spin spin" />
        </div>
      );
    }

    const emoji_counts = {
      like: 0,
      heart: 0,
      angry: 0,
      '100': 0
    };

    for (let i = 0; i < this.state.items.length; i++) {
      emoji_counts[this.state.items[i].type]++;
    }
    return (
      <div className="modal-body">
        <ul className="nav nav-tabs">
          <li>
            <button
              className={
                'btn btn-sm btn-vote pulsate-fwd' +
                (this.state.showing == 'all' ? ' upvoted ' : '')
              }
              style={{marginRight: '5px'}}
              type="button"
              data-id={this.props.post_id}
              onClick={() => {
                this.setState({
                  showing: 'all'
                });
              }}
            >
              All <span className="em_count">{this.state.items.length}</span>
            </button>
          </li>

          {emojis.map((emoji, i) => {
            return (
              <li key={emoji.key}>
                <button
                  className={
                    'btn btn-sm btn-vote pulsate-fwd' +
                    (this.state.showing == emoji.em ? ' upvoted ' : '')
                  }
                  style={{marginRight: '5px'}}
                  type="button"
                  data-id={this.props.post_id}
                  onClick={() => {
                    this.setState({
                      showing: emoji.em
                    });
                  }}
                >
                  <img
                    src={'/images/emoji/emoji_' + emoji.em + '.png'}
                    style={{
                      width: '20px'
                    }}
                  />{' '}
                  <span className="em_count">{emoji_counts[emoji.em]}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <br />
        <br />
        <table>
          <tbody>
            {this.state.items.map((item, i) => {
              if (
                this.state.showing != 'all' &&
                item.type != this.state.showing
              ) {
                return false;
              }
              const image_url =
                item.user && item.user.profile_picture
                  ? item.user.profile_picture
                  : 'https://ui-avatars.com/api/?size=30&name=' +
                    (item.user ? item.user.first_name : ' ') +
                    ' ' +
                    (item.user ? item.user.last_name : ' ') +
                    '&color=223cf3&background=000000';

              return (
                <tr key={item.id}>
                  <td>
                    <Link
                      onClick={() => {
                        this.props.dispatch(
                          closeModal({
                            id: 'following'
                          })
                        );
                      }}
                      className="image_avar"
                      to={item.user ? '/u/' + item.user.username : '#'}
                    >
                      <img className="img-circle " src={image_url} />@
                      {item.user.username}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {this.state.is_loaded && this.state.items.length < 1 && (
          <div className="alert alert-warning">No Users in this list</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps)(Reactions);
