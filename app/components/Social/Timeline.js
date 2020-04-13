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
  constructor(props) {
    super(props);
    this.state = {
      repost_done: false,
      show_comments: props.expand_comments ? true : false,
      is_pinned: false,
      added_comments: 0
    };
  }

  doDelete(id) {
    const a = confirm('Are you sure, you want to delete this post?');
    if (!a) {
      return false;
    }
    return fetch('/api/posts/delete', {
      method: 'post',
      body: JSON.stringify({post_id: id}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        this.setState({
          is_deleted: true
        });
      } else {
        alert('Failed to delete post!');
      }
    });
  }
  doFeature(id, type){
    if(!this.props.user)return false;
    if(this.props.user.role != 'admin' )
      return false;
      return fetch('/api/posts/doMakeFeatured?pid='+id+'&type='+type, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({post_id: id})
      }).then(response => {
        if (response.ok) {
          alert('Action Performed!');
        }else{
          alert("Failed to perform action.")
        }
      });

  }
  doPin(id, is_pinned) {
    if (this.props.post.user_id != this.props.user.id) {
      return;
    }
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
          content: post.post ? post.post : false,
          repost_from: post.id,
          is_repost: true,
          repost_of_user_id: post.user_id
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
    if (this.state.is_deleted) {
      return (
        <div className="alert alert-warning mt-1">
          This post has been deleted
        </div>
      );
    }
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
      <li data-image_url={image_url} className="comment">
        <Link
          className="image_alternate_feed"
          to={post.user ? '/u/' + post.user.username : '#'}
        >
          <img src={image_url} />
        </Link>
        <span className="text-date">
          <span className="float-right">
            <Link to={'/post/' + post.id}>
              {moment(post.created_at).format('lll')}{' '}
            </Link>
            {this.props.show_option_to_pin && (
              <button
                onClick={() => {
                  this.doPin(post.id, post.is_pinned);
                }}
                className={
                  (post.is_pinned ? ' is_pinned' : ' ') +
                  ' pinner btn btn-sm is_link mr-1'
                }
              >
                <i className="fa fa-thumbtack" />
              </button>
            )}
            { this.props.user && this.props.user.role == 'admin' && !this.props.disableSet ?
              <div className={'dropdown dib  mr-2'}>
                <button
                  className="btn m-0 btn-default bttn_submit dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Set as Clip of
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">

                  <a
                    className={ 'dropdown-item'  }
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      this.doFeature(post.id, 'week')
                    }}
                  >Week</a>
                  <a
                    className={ 'dropdown-item'  }
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      this.doFeature(post.id, 'month')
                    }}
                  >Month</a>
                </div>
              </div>
              : false
            }
            {this.props.show_option_to_pin && (
              <button
                onClick={() => {
                  this.doDelete(post.id);
                }}
                className={' btn-danger   btn btn-sm is_link'}
              >
                <i className="fa fa-trash" />
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
              @{post.user ? post.user.username : ''}
            </Link>{' '}
            {post.is_repost && post.original_poster ? (
              <span>
                (Repost from{' '}
                <Link to={'/post/' + post.repost_of} target="_blank">
                  @{post.original_poster.username}
                </Link>
                )
              </span>
            ) : (
              false
            )}
            {post.in_timeline_of && post.timeline_owner ? (
              <span>
                (in timeline of{' '}
                <Link to={'/u/' + post.timeline_owner.username} target="_blank">
                  @{post.timeline_owner.username}
                </Link>
                )
              </span>
            ) : (
              false
            )}
          </span>
        </span>
        {post.image_url ? (
          <Link
            to={'/post/' + post.id}
            className={
              'post_image' + (this.props.is_single ? '' : ' post_image_smaller')
            }
          >
            <img
              src={post.image_url}
              className="img-fluid"
              style={{marginBottom: '10px'}}
            />
          </Link>
        ) : (
          false
        )}
        {post.video_url ? (
          this.props.is_single ? (
            <div
              className="embed-responsive embed-responsive-21by9"
              style={{marginBottom: '10px'}}
            >
              <video controls>
                <source src={post.video_url} type="video/mp4" />
              </video>
            </div>
          ) : (
            <Link
              to={'/post/' + post.id}
              className={
                'post_image post_video' +
                (this.props.is_single ? '' : ' post_image_smaller')
              }
            >
              <div
                className="embed-responsive embed-responsive-21by9"
                style={{marginBottom: '10px'}}
              >
                <video controls>
                  <source src={post.video_url} type="video/mp4" />
                </video>
              </div>
            </Link>
          )
        ) : (
          false
        )}
        <p
          className="feed_post_content"
          dangerouslySetInnerHTML={{__html: typeof linkHashTags !=='undefined'  ? linkHashTags(post.post) : post.post}}
        />
        <span className="text-date" />
        <span className="social_btns">
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
                {post.comments
                  ? post.comments.length + this.state.added_comments
                  : '0'}{' '}
                <i className="fa fa-comment" />
              </button>
            }
          </span>
          <span>
            {this.props.user ? (
              <UpvoteButton
                post_id={post.id}
                key={post.id}
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
                {this.state.repost_done == true
                  ? 'Reposted'
                  : 'Repost' +
                    (post.repost_count ? '(' + post.repost_count + ')' : '')}
              </button>
            ) : (
              false
            )}
          </span>
          {this.state.show_comments && (
            <PostComments
              comments={post.comments}
              post_id={post.id}
              on_add={() => {
                this.setState({added_comments: this.state.added_comments + 1});
              }}
              is_single={this.props.is_single}
            />
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
