import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import UpvoteButton from '../Modules/UpvoteButton';
import PostComments from './PostComments';
import {add_post} from '../../actions/social';

// import anchorme from 'anchorme'; // ES6 / Typescript style imports

// const anchorThisText = function(text) {
//   const op = [];
//   const list = anchorme(text, {list: true}).forEach((x, i) => {
//     // console.log(raw);
//     op.push(x.raw);
//   });
//   // console.log(op);
// };

class Timeline extends React.Component {
  state = {repost_done: false, show_comments: false, is_pinned: false};

  doPin(id, is_pinned) {
    return fetch('/api/posts/doPin', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({post_id: id})
    }).then(response => {
      if (response.ok) {
        // response.json().then(json => {
        //   this.props.dispatch({
        //     type: 'SUCCESS',
        //     messages: Array.isArray(json) ? json : [json]
        //   });
        //   // window.location.href = '/m/' + json.match.id;
        // });
        this.setState({
          is_pinned: is_pinned ? 'no' : 'yes'
        });
      } else {
        // return response.json().then(json => {
        //   dispatch({
        //     type: 'FAILURE',
        //     messages: Array.isArray(json) ? json : [json]
        //   });
        // });
      }
    });
  }

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
    if (this.state.is_pinned == 'yes') {
      post.is_pinned = true;
    }
    if (this.state.is_pinned == 'no') {
      post.is_pinned = false;
    }

    return (
      <li data-image_url={image_url}>
        <Link
          className="image_alternate_feed"
          to={post.user ? '/u/' + post.user.username : '#'}
        >
          <img src={image_url} />
        </Link>
        <span className="text-date">
          <span className="float-right">
            {moment(post.created_at).format('lll')}{' '}
            {this.props.show_option_to_pin && (
              <button
                onClick={() => {
                  this.doPin(post.id, post.is_pinned);
                }}
                className={
                  (post.is_pinned ? ' is_pinned' : ' ') +
                  ' pinner btn btn-sm is_link'
                }
              >
                <i className="fa fa-thumb-tack" />
              </button>
            )}
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
        <p
          className="feed_post_content"
          dangerouslySetInnerHTML={{__html: linkHashTags(post.post)}}
        />
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
                    show_comments: !this.state.show_comments
                  });
                }}
              >
                {post.comments && post.comments.length
                  ? post.comments.length
                  : '0'}{' '}
                <i className="fa fa-comment" />
              </button>
            }
          </span>
          <span>
            {this.props.user ? (
              <UpvoteButton
                post_id={post.id}
                likes={post.like_count}
                me={this.props.user.id}
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
                <i className="fa fa-share-square" />{' '}
                {this.state.repost_done == true ? 'Reposted' : 'Repost'}
              </button>
            ) : (
              false
            )}
          </span>
          {this.state.show_comments && (
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
