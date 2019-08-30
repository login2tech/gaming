import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {upVote, downVote} from '../../actions/social';
import {openModal} from '../../actions/modals';
import Reactions from '../Modules/Modals/Reactions';
class UpvoteButton extends React.Component {
  state = {changed: false, doChange: 0};
  changeVote(already_voted, e, type, old_type) {
    if (old_type && old_type == type) {
      this.handleDownVote(e);
    } else {
      this.handleDownVote(e);
      setTimeout(() => {
        this.handleUpVote(e, type);
      }, 500);
    }
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
            this.setState({
              changed: type,
              doChange: this.state.doChange + 1
            });
          }
        }
      )
    );
  }

  handleDownVote(e) {
    if (this.props.total_count == 0 && !this.state.changed) {
      return;
    }
    this.props.dispatch(
      downVote(
        {
          post_id: this.props.post_id
          // type:this
        },
        res => {
          if (res) {
            this.setState({
              changed: 'NO',
              doChange: this.state.doChange - 1
            });
          }
        }
      )
    );
  }

  render() {
    let voted = this.props.liked ? true : false;
    if (this.state.changed) {
      voted = !voted;
    }

    let btn_class = 'btn btn-sm btn-vote pulsate-fwd action-upvote ';
    // btn_class += voted ? ' upvoted ' : '';
    btn_class += 'btn_4_ques_' + this.props.post_id;
    btn_class += this.props.disabled ? ' disabled ' : '';
    const emojis = [
      {key: 4, em: 'like'},
      {key: 3, em: 'heart'},
      {key: 2, em: 'angry'},
      {key: 1, em: '100'}
    ];
    const like_counts = {};
    let i_have_liked = false;
    let original_liked = false;
    let {likes} = this.props;

    
    if (!likes) {
      likes = [];
    }
    const likes_count = likes.length;
    for (let i = 0; i < likes_count; i++) {
      if (!like_counts[likes[i].type]) {
        like_counts[likes[i].type] = 1;
      } else {
        like_counts[likes[i].type]++;
      }
      if (likes[i].user_id == this.props.me) {
        i_have_liked = likes[i].type;
        original_liked = likes[i].type;
      }
    }
    if (this.state.changed) {
      i_have_liked = this.state.changed;
    }
    if (i_have_liked == 'NO') {
      i_have_liked = false;
    }
    if (original_liked === false && i_have_liked !== false) {
      like_counts[i_have_liked]++;
    }
    if (original_liked && i_have_liked != original_liked) {
      like_counts[original_liked]--;
      if (like_counts[original_liked] < 1) {
        like_counts[original_liked] = 0;
      }
      // alert(i_have_liked);
      if(i_have_liked)
      like_counts[i_have_liked] = like_counts[i_have_liked] +  1;
      // alert(like_counts[i_have_liked]);

      // like_counts[likes[i].type]++;
    }
    return (
      <span>
        {likes_count > 0 ? (
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
              {likes_count} reactions
            </Link>
          </small>
        ) : (
           <small style={{fontStyle: 'italic'}}>Be the first to react to this post</small>
        )}
        <br />
        {emojis.map((emoji, i) => {
          return (
            <button
              style={{marginRight: '5px'}}
              key={emoji.key}
              type="button"
              className={
                btn_class +
                (i_have_liked && i_have_liked == emoji.em ? ' upvoted ' : '   ')
              }
              data-id={this.props.post_id}
              onClick={e => {
                if (this.props.disabled) {
                  return;
                }
                this.changeVote(voted, e, emoji.em, i_have_liked);
              }}
            >
              <img
                src={'/images/emoji/emoji_' + emoji.em + '.png'}
                style={{
                  width: '20px',
                  marginRight: 5
                }}
              />
              <span className="hidden-sm-down">
                <span>
                  ({like_counts[emoji.em] ? like_counts[emoji.em] : '0'})
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
    token: state.auth.token
  };
};

export default connect(mapStateToProps)(UpvoteButton);
