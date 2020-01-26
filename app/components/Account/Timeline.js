import React from 'react';
import {connect} from 'react-redux';
import Timeline from '../Social/Timeline';
import ProfileHeader from './ProfileHeader';
import NewPost from './NewPost';
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: {
        first_name: ' ',
        last_name: ' ',
        followers: [],
        teams: [],
        xp_obj: [],
        score: []
      },
      filter: 'all',
      renderTab: 'profile',
      match_played: [],
      new_post_type: 'text',
      new_post_image: '',
      new_post_video: '',
      posts: [],
      posts_page: 1
    };
  }

  componentDidMount() {
    setTimeout(function() {
      const element = document.getElementById('is_top');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 500);
    this.fetchUserInfo(true);
  }

  fetchUserInfo(forward) {
    fetch('/api/user_info?uid=' + this.props.params.username)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              user_info: json.user_info
            },
            () => {
              if (forward) {
                this.fetchPosts();
              }
            }
          );
        }
      });
  }
  fetchPostsAgain(newfilter) {
    if (this.state.filter == newfilter) {
      return;
    }
    this.setState(
      {
        refreshing: true,
        posts_page: 1,
        filter: newfilter
      },
      () => {
        this.fetchPosts(true);
      }
    );
  }
  fetchPosts(refresh) {
    // console.log(this.props.user);
    if (!this.props.user) {
      return;
    }
    this.setState({
      new_posting: true
    });
    let fltr = 'a=b&';
    if (this.state.filter && this.state.filter != 'all') {
      fltr = 'filter=' + this.state.filter + '&';
    }

    fetch(
      '/api/posts/list/my?' +
        fltr +
        'uid=' +
        this.state.user_info.id +
        '&page=' +
        this.state.posts_page
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const items = refresh
            ? json.items
            : this.state.posts.concat(json.items);
          this.setState(
            {
              posts: items,
              new_posting: false
            },
            () => {
              //     this.fetchMatches();
            }
          );
        }
      });
  }

  tags = [1, 2, 3, 4, 5];
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    // 'Username',
    'Epic Games Username',
    'Steam Username',
    'Battletag'
  ];

  render() {
    return (
      <div>
        <ProfileHeader
          is_loaded={this.state.is_loaded}
          user_info={this.state.user_info}
          fetchUserInfo={this.fetchUserInfo.bind(this)}
          current_tab="timeline"
        />

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="row">
                  <div className="col-md-8 offset-md-2">
                    {this.state.user_info &&
                    this.props.user &&
                    this.props.user.id == this.state.user_info.id ? (
                      <NewPost
                        user_info={this.state.user_info}
                        onSubmit={post => {
                          const posts = this.state.posts;
                          posts.unshift(post);
                          clearInterval(this.inrvl);
                          this.inrvl = setInterval(
                            this.checkNewPosts.bind(this),
                            30000
                          );
                          this.setState({
                            posts: posts,
                            new_post_type: 'text',
                            new_post_image: '',
                            new_post_video: '',
                            new_post_content: ''
                          });
                        }}
                      />
                    ) : (
                      <NewPost
                        user_info={this.state.user_info}
                        is_in_timeline
                        onSubmit={post => {
                          const posts = this.state.posts;
                          posts.unshift(post);
                          this.setState({
                            posts: posts,
                            new_post_type: 'text',
                            new_post_image: '',
                            new_post_video: '',
                            new_post_content: ''
                          });
                        }}
                      />
                    )}

                    <br />
                    <h4 className="text-white">Latest Posts</h4>
                    <ul className="timeline">
                      {this.props.user ? (
                        false
                      ) : (
                        <div className="alert alert-warning">
                          You need to be logged in to see the posts
                        </div>
                      )}
                      <div className="filter-form mt-3">
                        <button
                          onClick={() => {
                            this.fetchPostsAgain('all');
                          }}
                          className={
                            (this.state.filter == 'all'
                              ? 'btn-primary '
                              : 'btn-outline ') + 'btn mr-1'
                          }
                        >
                          All
                        </button>
                        <button
                          onClick={() => {
                            this.fetchPostsAgain('videos');
                          }}
                          className={
                            (this.state.filter == 'videos'
                              ? 'btn-primary '
                              : 'btn-outline ') + 'btn mr-1 '
                          }
                        >
                          <span className="fa fa-video" /> Videos
                        </button>
                        <button
                          onClick={() => {
                            this.fetchPostsAgain('images');
                          }}
                          className={
                            (this.state.filter == 'images'
                              ? 'btn-primary '
                              : 'btn-outline ') + 'btn mr-1 '
                          }
                        >
                          <span className="fa fa-image" /> Images
                        </button>
                        <button
                          onClick={() => {
                            this.fetchPostsAgain('media');
                          }}
                          className={
                            (this.state.filter == 'media'
                              ? 'btn-primary '
                              : 'btn-outline ') + 'btn mr-1'
                          }
                        >
                          <span className=" fa fa-images" /> All Media
                        </button>
                      </div>
                      {this.props.user &&
                        this.state.posts &&
                        this.state.posts.map((post, i) => {
                          return (
                            <Timeline
                              expand_comments
                              post={post}
                              key={post.id}
                              show_option_to_pin
                            />
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Profile);
