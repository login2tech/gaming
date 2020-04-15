import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {new_comment} from '../../actions/social';
import {MentionsInput, Mention} from 'react-mentions';

import moment from 'moment';
// import UpvoteButton from '../Modules/UpvoteButton';
// import PostComments from './PostComments';
class PostComments extends React.Component {
  state = {new_post_content: '', posts: [], focussed: false};

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value.substr(0, 150)});
  }

  fetchUsers(query, callback) {
    if (!query) {
      return;
    }
    fetch(`/api/user_suggest?q=${query}`, {json: true})
      .then(res => res.json())

      // Transform the users to what react-mentions expects
      .then(res =>
        res.items.map(user => ({display: user.username, id: user.username}))
      )
      .then(callback);
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
            // const posts = this.state.posts;
            post.user = this.props.user;
            this.props.on_add && this.props.on_add(post);
            // posts.unshift(post);
            this.setState({
              // posts: posts,
              new_post_content: ''
            });
          }
        }
      )
    );
  }

  renderComment(comment) {
    return (
      <li key={comment.id} className="comment">
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

        <p dangerouslySetInnerHTML={{__html: linkHashTags(comment.comment)}} />
      </li>
    );
  }

  renderComment2(comment) {
    return (
      <li key={comment.id} className="comment">
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

        <p dangerouslySetInnerHTML={{__html: linkHashTags(comment.comment)}} />
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
            <li className="comment">
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
            <MentionsInput
              value={this.state.new_post_content}
              rows={this.state.focussed ? '3' : '1'}
              maxLength={'150'}
              onFocus={() => {
                this.setState({
                  focussed: true
                });
              }}
              onChange={(ev, newValue) => {
                // console.log(ev);
                // console.log(newValue);
                this.setState({
                  new_post_content: newValue.substr(0, 150)
                });
              }}
              style={{
                control: {
                  // backgroundColor: '#fff',
                  backgroundColor: '#333',
                  // boxShadow: '3px 3px 10px 1px rgba(0, 0, 0, 0.1)',
                  // borderColor: '#7a7a7a',
                  // padding: '12px 15px',
                  marginBottom: '20px',
                  borderRadius: '0px',
                  fontSize: 14,
                  fontWeight: 'normal'
                },

                highlighter: {
                  overflow: 'hidden'
                },

                input: {
                  margin: 0
                },

                '&singleLine': {
                  control: {
                    display: 'inline-block',

                    width: 130
                  },

                  highlighter: {
                    padding: 1,
                    border: '2px inset transparent'
                  },

                  input: {
                    padding: 1,

                    border: '2px inset'
                  }
                },

                '&multiLine': {
                  control: {
                    // fontFamily: 'monospace',
                    // border: '1px solid silver'
                  },

                  highlighter: {
                    padding: 9
                  },

                  input: {
                    padding: 9,
                    color: '#fff',
                    // minHeight: 100,
                    height: this.state.focussed ? '100px' : '40px',
                    outline: 0,
                    border: 0
                  }
                },

                suggestions: {
                  list: {
                    backgroundColor: 'white',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: 14
                  },

                  item: {
                    padding: '5px 15px',
                    borderBottom: '1px solid rgba(0,0,0,0.15)',
                    color: '#000',
                    '&focused': {
                      backgroundColor: '#cee4e5'
                    }
                  }
                }
              }}
              placeholder="Add a comment? "
            >
              <Mention
                displayTransform={login => {
                  return `@${login}`;
                }}
                markup={'@(__id__)'}
                trigger="@"
                data={this.fetchUsers.bind(this)}
                style={{
                  backgroundColor: '#114afb'
                }}
              />
            </MentionsInput>
          </div>
          {this.state.focussed && (
            <button type="submit" className="btn btn-primary">
              Comment
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
