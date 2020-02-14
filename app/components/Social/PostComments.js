import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {new_comment} from '../../actions/social';

import moment from 'moment';
// import UpvoteButton from '../Modules/UpvoteButton';
// import PostComments from './PostComments';
class PostComments extends React.Component {
  state = {new_post_content: '', posts: [], focussed: false};

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  doComment(event) {
    event.preventDefault();
    this.props.dispatch(
      new_comment(
        {
          comment: this.state.new_post_content,
          post_id: this.props.post_id
        },
        (result, post) => {
          if (result) {
            const posts = this.state.posts;
            this.props.on_add && this.props.on_add();
            posts.unshift(post);
            this.setState({
              posts: posts,
              new_post_content: ''
            });
          }
        }
      )
    );
  }

  renderComment(comment) {
    return (
      <li key={comment.id}>
        <span className="text-date">
          <span className="float-right">
            {moment(comment.created_at).format('lll')}
          </span>
          <span className="">
            <Link to={'/u/' + comment.user.username}>
              @{comment.user.username}
            </Link>
          </span>
        </span>

        <p>{comment.comment}</p>
      </li>
    );
  }

  renderComment2(comment) {
    return (
      <li key={comment.id}>
        <span className="text-date">
          <span className="float-right">
            {moment(comment.created_at).format('lll')}
          </span>
          <span className="">
            <Link to={'/u/' + this.props.user.username}>
              @{this.props.user.username}
            </Link>
          </span>
        </span>

        <p>{comment.comment}</p>
      </li>
    );
  }

  render() {
    // if (!this.props.comments) {
    //   return false;
    // }
    return (
      <div className="comment_list">
        <ul>
          {this.props.comments &&
            this.props.comments.map((comment, i) => {
              if (
                !this.props.is_single &&
                i > 1 &&
                this.props.comments.length > 1
              ) {
                return false;
              }
              return this.renderComment(comment);
            })}
          {this.state.posts.map((comment, i) => this.renderComment2(comment))}
          {!this.props.is_single &&
          this.props.comments &&
          this.props.comments.length > 1 ? (
            <li>
              <a href={'/post/' + this.props.post_id}>Show all comments</a>
            </li>
          ) : (
            false
          )}
        </ul>
        <div className="text-date" />
        <form
          onSubmit={event => {
            this.doComment(event);
          }}
          // onBlur={() => {
          //   this.setState({
          //     focussed: false
          //   });
          // }}
        >
          <div className="form-group">
            <textarea
              className="form-control"
              id="new_post_content"
              onFocus={() => {
                this.setState({
                  focussed: true
                });
              }}
              required
              rows={this.state.focussed ? '3' : '1'}
              value={this.state.new_post_content}
              placeholder="Add a comment?"
              name="new_post_content"
              onChange={this.handleChange.bind(this)}
            />
          </div>
          {this.state.focussed && (
            <button type="submit" className="btn btn-primary">
              Reply
            </button>
          )}
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    // token: state.auth.token,
    user: state.auth.user,
    // settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(PostComments);
