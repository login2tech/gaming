import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {upVote, downVote} from '../../actions/social';
import {openModal} from '../../actions/modals';
import Reactions from '../Modules/Modals/Reactions';
class UpvoteButton extends React.Component {
  state = {
    original_likes: this.props.likes ? this.props.likes : [],
    my_original_like: '',
    current_like: '',
    likes_obj: {
      like: 0,
      heart: 0,
      angry: 0,
      '100': 0
    },
    total_count: this.props.likes ? this.props.likes.length : 0
  };

  changeVote(e, type) {
    this.setState(
      {
        loading_for_emoji: type
      },
      () => {
        if (this.state.current_like == type) {
          this.handleDownVote(e, type, true);
        } else {
          this.handleDownVote(e, this.state.current_like);
          setTimeout(() => {
            this.handleUpVote(e, type);
          }, 500);
        }
      }
    );
  }

  handleUpVote(e, type) {
    this.props.dispatch(
      upVote(
        {
          post_id: this.props.post_id,
          type: type
        },
        res => {
          if (res) {
            const likes_obj = this.state.likes_obj;
            likes_obj[type]++;
            this.setState({
              likes_obj: likes_obj,
              current_like: type,
              total_count: this.state.total_count + 1
            });
          }
          this.setState({
            loading_for_emoji: false
          });
        }
      )
    );
  }

  handleDownVote(e, type, d) {
    this.props.dispatch(
      downVote(
        {
          post_id: this.props.post_id
        },
        res => {
          if (res) {
            const likes_obj = this.state.likes_obj;

            likes_obj[type]--;
            this.setState({
              likes_obj: likes_obj,
              current_like: '',
              total_count: this.state.total_count - 1
            });
          }
          if (d) {
            this.setState({
              loading_for_emoji: false
            });
          }
        }
      )
    );
  }

  componentDidMount() {
    this.storeOriginal();
  }

  emojis = [
    {key: 4, em: 'like'},
    {key: 3, em: 'heart'},
    {key: 2, em: 'angry'},
    {key: 1, em: '100'}
  ];

  storeOriginal() {
    console.log(this.props.likes);
    const total_count = this.props.likes.length;
    let my_original_like = '';
    const likes_obj = {
      like: 0,
      heart: 0,
      angry: 0,
      '100': 0
    };
    for (let i = 0; i < total_count; i++) {
      likes_obj[this.props.likes[i].type]++;
      if (this.props.likes[i].user_id == this.props.user.id) {
        my_original_like = this.props.likes[i].type;
      }
    }
    this.setState({
      original_likes: this.props.likes,
      my_original_like: my_original_like,
      current_like: my_original_like,
      likes_obj: likes_obj,
      total_count: total_count
    });
  }

  render() {
    // let voted = this.props.liked ? true : false;
    // if (this.state.changed) {
    //   voted = !voted;
    // }
    let btn_class = 'btn btn-sm btn-vote pulsate-fwd action-upvote ';
    btn_class += 'btn_4_ques_' + this.props.post_id;
    btn_class += this.props.disabled ? ' disabled ' : '';

    console.log(this.state);
    return (
      <span>
        {this.state.total_count > 0 ? (
          <small style={{fontStyle: 'italic'}}>
            this post got{' '}
            <Link
              to={'#'}
              style={{color: '#3c9c8e'}}
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(
                  openModal({
                    id: 'likes_details',
                    type: 'custom',
                    zIndex: 1075,
                    heading: 'Reactions',
                    content: (
                      <Reactions
                        likes={this.props.likes}
                        post_id={this.props.post_id}
                      />
                    )
                  })
                );
              }}
            >
              {' '}
              {this.state.total_count} reactions
            </Link>
          </small>
        ) : (
          <small style={{fontStyle: 'italic'}}>
            Be the first to react to this post
          </small>
        )}
        <br />
        {this.emojis.map((emoji, i) => {
          return (
            <button
              style={{marginRight: '5px'}}
              key={emoji.key}
              type="button"
              className={
                btn_class +
                (this.state.current_like == emoji.em ? ' upvoted ' : '   ')
              }
              data-id={this.props.post_id}
              onClick={e => {
                if (this.props.disabled) {
                  return;
                }
                this.changeVote(e, emoji.em);
              }}
            >
              {this.state.loading_for_emoji == emoji.em ? (
                <>
                  <span className="fa fa-spin fa-spinner" />{' '}
                </>
              ) : (
                <img
                  src={'/images/emoji/emoji_' + emoji.em + '.png'}
                  style={{
                    width: '20px',
                    marginRight: 5
                  }}
                />
              )}
              <span className="hidden-sm-down">
                <span>
                  (
                  {this.state.likes_obj[emoji.em]
                    ? this.state.likes_obj[emoji.em]
                    : '0'}
                  )
                  {/* {this.state.changed
                    ? this.props.total_count
                      ? this.props.total_count + this.state.doChange
                      : '1'
                    : this.props.total_count
                      ? this.props.total_count
                      : '0'} */}
                </span>
              </span>
            </button>
          );
        })}
      </span>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user
  };
};

export default connect(mapStateToProps)(UpvoteButton);
