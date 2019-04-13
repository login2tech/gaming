import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import UpvoteButton from '../Modules/UpvoteButton';
import PostComments from './PostComments';
import {add_post} from '../../actions/social';
class Timeline extends React.Component {
  state = {repost_done: false};
  doRepost() {
    const {post} = this.props;
    this.props.dispatch(
      add_post(
        {
          // post_type: post.new_post_type ? post.new_post_type : false,
          image_url: post.image_url ? post.image_url : false,
          video_url: post.video_url ? post.video_url : false,
          content: post.post ? post.post : false
        },
        this.props.token,
        (result, post) => {
          if (result) {
            this.setState({
              repost_done: true
            });
            // const posts = this.state.posts;
            // posts.unshift(post);
            // this.setState({
            //   posts: posts,
            //   new_post_type: 'text',
            //   new_post_image: '',
            //   new_post_video: '',
            //   new_post_content: ''
            // });
          }
        }
      )
    );
  }
  state = {};
  render() {
    const {post} = this.props;
    const image_url =
      post.user && post.user.profile_picture
        ? post.user.profile_picture
        : 'https://ui-avatars.com/api/?size=30&name=' +
          (post.user ? post.user.first_name : ' ') +
          ' ' +
          (post.user ? post.user.last_name : ' ') +
          '&color=223cf3&background=000000';

    return (
      <li data-image_url={image_url}>
        <span className="image_alternate_feed">
          <img src={image_url} />
        </span>
        <span className="text-date">
          <span className="float-right">
            {moment(post.created_at).format('lll')}
          </span>
          <span className="">
            <Link
              to={
                '/u/' +
                (post.user ? post.user.username : this.props.user.username)
              }
            >
              {post.user ? post.user.first_name : ''}{' '}
              {post.user ? post.user.last_name : ''}
            </Link>
          </span>
        </span>
        {post.image_url ? (
          <img
            src={post.image_url}
            className="img-fluid"
            style={{marginBottom: '10px'}}
          />
        ) : (
          false
        )}
        {post.video_url ? (
          <div
            className="embed-responsive embed-responsive-21by9"
            style={{marginBottom: '10px'}}
          >
            <video controls>
              <source src={post.video_url} type="video/mp4" />
            </video>
          </div>
        ) : (
          false
        )}
        <p>{post.post}</p>

        <span className="text-date" />
        <span className="">
          <span className="float-right">
            {
              <button
                type="button"
                className="btn btn-sm is_link"
                onClick={event => {
                  event.preventDefault();
                  this.setState({
                    comments_to_show_of: post.id
                  });
                }}
              >
                {post.comments && post.comments.length
                  ? post.comments.length
                  : '0'}{' '}
                comments
              </button>
            }
          </span>
          <span>
            {this.props.user ? (
              <UpvoteButton
                post_id={post.id}
                total_count={post.like_count ? post.like_count.length : 0}
                me={this.props.user.id}
                liked={
                  post.upvotes && post.upvotes.length && post.upvotes[0].post_id
                    ? true
                    : false
                }
                disabled={!this.props.user}
              />
            ) : (
              <span>
                {post.like_count ? post.like_count.length : '0'} likes
              </span>
            )}{' '}
            {this.props.user ? (
              <button
                type="button"
                onClick={() => {
                  this.doRepost();
                }}
                className="btn btn-sm"
              >
                {this.state.repost_done == true ? 'Reposted' : 'Repost'}
              </button>
            ) : (
              false
            )}
          </span>
          {this.state.comments_to_show_of == post.id && (
            <PostComments comments={post.comments} post_id={post.id} />
          )}
        </span>
      </li>
    );
  }
}
const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    // settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Timeline);
