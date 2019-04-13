import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {new_comment} from '../../actions/social';

import moment from 'moment';
// import UpvoteButton from '../Modules/UpvoteButton';
// import PostComments from './PostComments';
class PostComments extends React.Component {
  state = {new_post_content: '', posts: []};

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
              {comment.user.first_name} {comment.user.last_name}
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
              {this.props.user.first_name} {this.props.user.last_name}
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
      <div>
        <ul>
          {this.props.comments &&
            this.props.comments.map((comment, i) =>
              this.renderComment(comment)
            )}
          {this.state.posts.map((comment, i) => this.renderComment2(comment))}
        </ul>
        <div className="text-date" />
        <form
          onSubmit={event => {
            this.doComment(event);
          }}
        >
          <div className="form-group">
            <textarea
              className="form-control"
              id="new_post_content"
              required
              rows="3"
              value={this.state.new_post_content}
              placeholder="Add a comment?"
              name="new_post_content"
              onChange={this.handleChange.bind(this)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Post Comment
          </button>
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
